# SSSLite application Kubernetes Kustomize overlay configuration

Declarative management of SSSLite Kubernetes resources using Kustomize.

## How to use

Within an overlay directory, create a `.env` file to contain required secret
values in the format KEY=value (i.e. `overlays/uat/.env`).

Review the built resource output using `kustomize`:

```bash
kustomize build kustomize/overlays/uat/ | less
```

Run `kubectl` with the `-k` flag to generate resources for a given overlay:

```bash
kubectl apply -k kustomize/overlays/uat --namespace sss --dry-run=client
```

## Resource Summary

### Base Resources (shared by both overlays)

| Kind | Base Name | Description |
|------|-----------|-------------|
| `Deployment` | `ssslite-deployment` | Single container (`ghcr.io/dbca-wa/ssslite`), non-root, read-only FS, `/tmp` tmpfs, probes on `/livez` & `/readyz` port 8080, prefers ARM64 nodes, anti-affinity spread |
| `HorizontalPodAutoscaler` | `ssslite-deployment-hpa` | min 2 / max 5 replicas, CPU utilization target 500% |
| `Service` | `ssslite-clusterip` | ClusterIP on port 8080 |
| `NetworkPolicy` | `ssslite-networkpolicy-egress-deny` | Default-deny all egress for all pods |
| `CiliumNetworkPolicy` | `ssslite-ciliumnetworkpolicy-egress-allow` | Allows DNS (kube-dns) + egress to `*.slip.wa.gov.au` and `*.dbca.wa.gov.au` |
| `NetworkPolicy` | `ssslite-networkpolicy-ingress-deny` | Default-deny all ingress for all pods |
| `NetworkPolicy` | `ssslite-networkpolicy-ingress-allow` | Allows ingress on port 8080 from `ingress-nginx` pods |

### UAT Overlay (`nameSuffix: -uat`)

All resource names gain the `-uat` suffix. Additional/modified resources:

| Kind | Name | Notes |
|------|------|-------|
| `Secret` | `ssslite-env-uat` | Generated from `.env` (SLIP URL, username, password) |
| `Ingress` | `ssslite-ingress-uat` | nginx class, host: `ssslite-uat.dbca.wa.gov.au` → `ssslite-clusterip-uat:8080` |
| `PodDisruptionBudget` | `ssslite-pdb-uat` | `minAvailable: 1` |
| Deployment patch | — | Injects `ssslite-env-uat` secret as `envFrom`; `imagePullPolicy: Always` (base default) |
| HPA patch | — | `scaleTargetRef.name: ssslite-deployment-uat` |
| Image | — | No tag pin — uses whatever is in the base image reference |

### Prod Overlay (`nameSuffix: -prod`)

| Kind | Name | Notes |
|------|------|-------|
| `Secret` | `ssslite-env-prod` | Generated from `.env` (SLIP URL, username, password) |
| `Ingress` | `ssslite-ingress-prod` | nginx class, host: `ssslite.dbca.wa.gov.au` → `ssslite-clusterip-prod:8080` |
| `PodDisruptionBudget` | `ssslite-pdb-prod` | `minAvailable: 1` |
| Deployment patch | — | Injects `ssslite-env-prod` secret as `envFrom`; `imagePullPolicy: IfNotPresent` |
| HPA patch | — | `scaleTargetRef.name: ssslite-deployment-prod` |
| Image | — | Pinned to tag `1.0.9` (`ghcr.io/dbca-wa/ssslite:1.0.9`) |

### Network Controls

The base applies a default-deny posture for both ingress and egress using standard Kubernetes `NetworkPolicy` resources, then carves out explicit allow rules. Egress allow rules use `CiliumNetworkPolicy` to leverage Cilium's FQDN-aware filtering.

#### Ingress

| Resource | Kind | Effect |
|----------|------|--------|
| `ssslite-networkpolicy-ingress-deny` | `NetworkPolicy` | Selects **all pods** in the namespace; denies all inbound traffic by default |
| `ssslite-networkpolicy-ingress-allow` | `NetworkPolicy` | Selects **all pods**; allows TCP port 8080 from pods in the `ingress-nginx` namespace with label `app.kubernetes.io/name: ingress-nginx` |

Only traffic arriving via the NGINX ingress controller is permitted into the application pods. Direct pod-to-pod or external access is blocked.

#### Egress

| Resource | Kind | Effect |
|----------|------|--------|
| `ssslite-networkpolicy-egress-deny` | `NetworkPolicy` | Selects **all pods** in the namespace; denies all outbound traffic by default |
| `ssslite-ciliumnetworkpolicy-egress-allow` | `CiliumNetworkPolicy` | Selects pods with label `app: ssslite-deployment`; allows the two rules below |

Allowed egress from application pods:

1. **DNS resolution** — UDP/TCP port 53 to `kube-dns` pods in `kube-system` (all query patterns permitted).
2. **Upstream API access** — HTTPS to `*.slip.wa.gov.au` and `*.dbca.wa.gov.au` (resolved via Cilium FQDN filtering).

All other outbound connections (including to other pods, the Kubernetes API, or arbitrary internet destinations) are blocked.

> **Note:** The egress deny uses a standard `NetworkPolicy` (applies to all pods), while the egress allow uses a `CiliumNetworkPolicy` scoped only to `ssslite-deployment` pods. Both overlays inherit these controls unchanged from the base.

### Key Differences: UAT vs Prod

| Aspect | UAT | Prod |
|--------|-----|------|
| Resource name suffix | `-uat` | `-prod` |
| Image tag | unpinned (latest) | `1.0.9` |
| `imagePullPolicy` | `Always` | `IfNotPresent` |
| Ingress hostname | `ssslite-uat.dbca.wa.gov.au` | `ssslite.dbca.wa.gov.au` |

## References:

- <https://kubernetes.io/docs/tasks/manage-kubernetes-objects/kustomization/>
- <https://github.com/kubernetes-sigs/kustomize>
- <https://github.com/kubernetes-sigs/kustomize/tree/master/examples>
