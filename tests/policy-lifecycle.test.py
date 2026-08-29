from pathlib import Path
import json
import yaml

root = Path(__file__).resolve().parents[1]
manifest = json.loads((root / "registries/project-manifest.json").read_text())
registry = yaml.safe_load((root / "policies/capability-registry.yaml").read_text())
routing = yaml.safe_load((root / "policies/routing.yaml").read_text())

assert registry["manifest_ref"] == "registries/project-manifest.json"
assert routing["manifest_ref"] == registry["manifest_ref"]
assert registry["lifecycle_semantics"]["approved_does_not_imply_active"] is True
assert routing["execution_policy"]["approved_is_routable"] is False
assert routing["routes"]["approved_design"]["executable"] is False
assert routing["routes"]["legacy_synthetic"]["data_scope"] == "SYNTHETIC_ONLY"
assert routing["routes"]["performance_a2_supervised"]["runtime_status"] == "SHADOW"
assert routing["routes"]["performance_a2_supervised"]["data_scope"] == "SYNTHETIC_ONLY"
assert routing["routes"]["performance_a2_supervised"]["external_effects"] == "PROHIBITED"
assert routing["routes"]["performance_a3_gap_supervised"]["runtime_status"] == "SHADOW"
assert routing["routes"]["performance_a3_gap_supervised"]["data_scope"] == "SYNTHETIC_ONLY"
assert registry["transversal_capabilities"]["retired_knowledge_manager"]["child_runtime_status"] == "RETIRED"

for domain_name, domain_manifest in manifest["domains"].items():
    domain_registry = registry["domains"][domain_name]
    assert domain_registry["manager"]["id"] == domain_manifest["manager"]["id"]
    assert domain_registry["manager"]["version"] == domain_manifest["manager"]["version"]
    assert domain_registry["manager"]["runtime_status"] == "INACTIVE"
    registry_ids = {item["id"] for item in domain_registry["specialists"].values()}
    manifest_ids = {item["id"] for item in domain_manifest["specialists"]}
    assert registry_ids == manifest_ids

assert sum(len(domain["specialists"]) for domain in registry["domains"].values()) == 21
performance = registry["domains"]["performance"]["specialists"]["calcular_pontuacao_estado"]
assert performance["runtime_status"] == "SHADOW"
assert performance["data_scope"] == "SYNTHETIC_ONLY"
assert performance["external_effects"] == "PROHIBITED"
gap = registry["domains"]["performance"]["specialists"]["analisar_gaps_cenarios"]
assert gap["runtime_status"] == "SHADOW"
assert gap["data_scope"] == "SYNTHETIC_ONLY"
plan = registry["domains"]["performance"]["specialists"]["construir_plano_executavel"]
assert plan["runtime_status"] == "SHADOW"
assert plan["data_scope"] == "SYNTHETIC_ONLY"
print("policy-lifecycle: manifesto, registro e roteamento reconciliados")
