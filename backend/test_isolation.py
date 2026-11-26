import sys
from pathlib import Path
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

import urllib.request
import json
import time

def test_therapist_isolation():
    base_url = "http://127.0.0.1:8000/api"

    # 1. Login as Demo Therapist
    print("\n--- 1. Testing Demo Therapist ---")
    req_demo = urllib.request.Request(
        f"{base_url}/auth/demo-login",
        data=b"{}",
        headers={"Content-Type": "application/json"}
    )
    res_demo = json.loads(urllib.request.urlopen(req_demo).read().decode())
    demo_token = res_demo["token"]
    print("Demo therapist logged in:", res_demo["user"]["email"])

    req_demo_children = urllib.request.Request(
        f"{base_url}/children",
        headers={"Authorization": f"Bearer {demo_token}"}
    )
    demo_children = json.loads(urllib.request.urlopen(req_demo_children).read().decode())
    print(f"Demo therapist has {len(demo_children)} children: {[c['name'] for c in demo_children]}")
    assert len(demo_children) == 3, f"Expected 3 demo children, got {len(demo_children)}"

    # 2. Register a Brand-New Fresh Therapist
    print("\n--- 2. Registering Fresh Therapist ---")
    fresh_email = f"fresh_therapist_{int(time.time())}@simats.edu"
    req_register = urllib.request.Request(
        f"{base_url}/auth/register",
        data=json.dumps({
            "email": fresh_email,
            "password": "Password123!",
            "displayName": "Dr. Fresh Specialist",
            "organization": "SIMATS Pediatric OT"
        }).encode(),
        headers={"Content-Type": "application/json"}
    )
    res_fresh = json.loads(urllib.request.urlopen(req_register).read().decode())
    fresh_token = res_fresh["token"]
    print("Fresh therapist registered:", res_fresh["user"]["email"])

    # 3. Query Children for the Fresh Therapist
    req_fresh_children = urllib.request.Request(
        f"{base_url}/children",
        headers={"Authorization": f"Bearer {fresh_token}"}
    )
    fresh_children = json.loads(urllib.request.urlopen(req_fresh_children).read().decode())
    print(f"Fresh therapist starts with {len(fresh_children)} children (MUST BE 0): {fresh_children}")
    assert len(fresh_children) == 0, f"Error: Fresh therapist should have 0 children, but got {len(fresh_children)}"

    # 4. Fresh Therapist adds their own child
    print("\n--- 3. Fresh Therapist adds child 'Arjun Verma' ---")
    req_add_child = urllib.request.Request(
        f"{base_url}/children",
        data=json.dumps({
            "name": "Arjun Verma",
            "age": 7,
            "gender": "male",
            "baselineAssistanceLevel": 1,
            "preferredLanguage": "en",
            "clinicalNotes": "Fresh therapist patient record"
        }).encode(),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {fresh_token}"
        }
    )
    added_child = json.loads(urllib.request.urlopen(req_add_child).read().decode())
    print(f"Child added: {added_child['name']} (ID: {added_child['id']})")

    # Re-query fresh therapist's children
    fresh_children_updated = json.loads(urllib.request.urlopen(req_fresh_children).read().decode())
    print(f"Fresh therapist now has {len(fresh_children_updated)} child: {[c['name'] for c in fresh_children_updated]}")
    assert len(fresh_children_updated) == 1
    assert fresh_children_updated[0]["name"] == "Arjun Verma"

    # 5. Verify Demo Therapist DOES NOT see Arjun Verma
    demo_children_recheck = json.loads(urllib.request.urlopen(req_demo_children).read().decode())
    print(f"Demo therapist still has {len(demo_children_recheck)} children: {[c['name'] for c in demo_children_recheck]}")
    assert "Arjun Verma" not in [c["name"] for c in demo_children_recheck]

    print("\n>>> ALL MULTI-THERAPIST ISOLATION CHECKS PASSED 100%! <<<")

if __name__ == "__main__":
    test_therapist_isolation()
