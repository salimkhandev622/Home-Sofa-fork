#!/usr/bin/env python3
"""
Test script to verify GitHub API credentials and repository access
for the Home Sofa admin dashboard.
"""

import requests
import json
import base64
import sys
import io
import os

# Fix encoding for Windows console
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# GitHub API Configuration
GITHUB_OWNER = "salimkhandev622"
GITHUB_REPO = "Home-Sofa-fork"
GITHUB_TOKEN = os.environ.get('GITHUB_TOKEN', '')
GITHUB_BRANCH = "main"

# API Headers
headers = {
    "Authorization": f"token {GITHUB_TOKEN}",
    "Accept": "application/vnd.github.v3+json",
    "Content-Type": "application/json"
}

def test_authentication():
    """Test basic GitHub API authentication"""
    print("[LOCK] Testing GitHub API Authentication...")
    if not GITHUB_TOKEN:
        print("[WARN] No GitHub token provided. Set GITHUB_TOKEN environment variable.")
        return False
    try:
        response = requests.get("https://api.github.com/user", headers=headers)
        if response.status_code == 200:
            user_data = response.json()
            print(f"[OK] Authentication successful! Logged in as: {user_data.get('login')}")
            return True
        else:
            print(f"[FAIL] Authentication failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"[FAIL] Authentication error: {e}")
        return False

def test_repository_access():
    """Test access to the specific repository"""
    print(f"\n[FOLDER] Testing Repository Access: {GITHUB_OWNER}/{GITHUB_REPO}...")
    try:
        response = requests.get(
            f"https://api.github.com/repos/{GITHUB_OWNER}/{GITHUB_REPO}",
            headers=headers
        )
        if response.status_code == 200:
            repo_data = response.json()
            print(f"[OK] Repository access successful!")
            print(f"   Repository: {repo_data.get('full_name')}")
            print(f"   Description: {repo_data.get('description', 'No description')}")
            print(f"   Default branch: {repo_data.get('default_branch')}")
            print(f"   Private: {repo_data.get('private')}")
            return True
        elif response.status_code == 404:
            print(f"[FAIL] Repository not found: {GITHUB_OWNER}/{GITHUB_REPO}")
            print("   Please verify the repository exists on GitHub.")
            return False
        else:
            print(f"[FAIL] Repository access failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"[FAIL] Repository access error: {e}")
        return False

def test_file_read():
    """Test reading a file from the repository"""
    print(f"\n[READ] Testing File Read Operation...")
    try:
        # Try to read the README file
        response = requests.get(
            f"https://api.github.com/repos/{GITHUB_OWNER}/{GITHUB_REPO}/contents/README.md?ref={GITHUB_BRANCH}",
            headers=headers
        )
        if response.status_code == 200:
            file_data = response.json()
            print(f"[OK] File read successful!")
            print(f"   File: {file_data.get('name')}")
            print(f"   Size: {file_data.get('size')} bytes")
            print(f"   SHA: {file_data.get('sha')[:10]}...")
            return True
        elif response.status_code == 404:
            print(f"[WARN] README.md not found (this is okay if the file doesn't exist)")
            return True
        else:
            print(f"[FAIL] File read failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"[FAIL] File read error: {e}")
        return False

def test_file_write():
    """Test writing a file to the repository"""
    print(f"\n[WRITE] Testing File Write Operation...")
    if not GITHUB_TOKEN:
        print("[WARN] Skipping write test - no token provided")
        return True
    try:
        # Create a test file
        test_content = "This is a test file created by the GitHub API test script."
        content_base64 = base64.b64encode(test_content.encode()).decode()
        
        # First check if file exists
        check_response = requests.get(
            f"https://api.github.com/repos/{GITHUB_OWNER}/{GITHUB_REPO}/contents/test-api-test.txt?ref={GITHUB_BRANCH}",
            headers=headers
        )
        
        sha = None
        if check_response.status_code == 200:
            file_data = check_response.json()
            sha = file_data.get('sha')
            print(f"   File exists, will update (SHA: {sha[:10]}...)")
        
        # Create or update file
        put_data = {
            "message": "Test file write via API test script",
            "content": content_base64,
            "branch": GITHUB_BRANCH
        }
        
        if sha:
            put_data["sha"] = sha
        
        response = requests.put(
            f"https://api.github.com/repos/{GITHUB_OWNER}/{GITHUB_REPO}/contents/test-api-test.txt",
            headers=headers,
            data=json.dumps(put_data)
        )
        
        if response.status_code in [200, 201]:
            result = response.json()
            print(f"[OK] File write successful!")
            print(f"   File: test-api-test.txt")
            print(f"   Commit: {result.get('commit').get('sha')[:10]}...")
            print(f"   URL: {result.get('content').get('html_url')}")
            return True
        else:
            print(f"[FAIL] File write failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"[FAIL] File write error: {e}")
        return False

def test_github_actions():
    """Test GitHub Actions access"""
    print(f"\n[GEAR] Testing GitHub Actions Access...")
    try:
        response = requests.get(
            f"https://api.github.com/repos/{GITHUB_OWNER}/{GITHUB_REPO}/actions/runs?branch={GITHUB_BRANCH}&per_page=1",
            headers=headers
        )
        if response.status_code == 200:
            data = response.json()
            print(f"[OK] GitHub Actions access successful!")
            print(f"   Total workflow runs: {data.get('total_count')}")
            
            if data.get('workflow_runs'):
                latest_run = data['workflow_runs'][0]
                print(f"   Latest run:")
                print(f"   - Status: {latest_run.get('status')}")
                print(f"   - Conclusion: {latestRun.get('conclusion', 'N/A')}")
                print(f"   - Event: {latest_run.get('event')}")
                print(f"   - Created: {latest_run.get('created_at')}")
            else:
                print(f"   No workflow runs found (this is okay if Actions aren't set up yet)")
            return True
        elif response.status_code == 404:
            print(f"[WARN] GitHub Actions not enabled for this repository")
            print("   This is okay - Actions may not be configured yet")
            return True
        else:
            print(f"[FAIL] GitHub Actions access failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"[FAIL] GitHub Actions error: {e}")
        return False

def test_data_files():
    """Test access to data files used by the admin dashboard"""
    print(f"\n[LIST] Testing Data Files Access...")
    data_files = [
        "admin/data/products.json",
        "admin/data/services.json",
        "admin/data/reviews.json",
        "admin/data/hero-slides.json",
        "public/data/products.json",
        "public/data/services.json"
    ]
    
    success_count = 0
    for file_path in data_files:
        try:
            response = requests.get(
                f"https://api.github.com/repos/{GITHUB_OWNER}/{GITHUB_REPO}/contents/{file_path}?ref={GITHUB_BRANCH}",
                headers=headers
            )
            if response.status_code == 200:
                print(f"   [OK] {file_path} - Found")
                success_count += 1
            elif response.status_code == 404:
                print(f"   [WARN] {file_path} - Not found (will be created)")
                success_count += 1  # Not existing is okay
            else:
                print(f"   [FAIL] {file_path} - Error: {response.status_code}")
        except Exception as e:
            print(f"   [FAIL] {file_path} - Error: {e}")
    
    if success_count == len(data_files):
        print(f"[OK] All data files accessible or ready to be created")
        return True
    else:
        print(f"[WARN] Some data files had issues")
        return False

def main():
    """Run all tests"""
    print("=" * 60)
    print("GitHub API Test Script for Home Sofa Admin Dashboard")
    print("=" * 60)
    
    if not GITHUB_TOKEN:
        print("\n[INFO] No GITHUB_TOKEN environment variable set.")
        print("       Tests will be limited without authentication.")
        print("       Set GITHUB_TOKEN to enable full testing.")
    
    tests = [
        ("Authentication", test_authentication),
        ("Repository Access", test_repository_access),
        ("File Read", test_file_read),
        ("File Write", test_file_write),
        ("GitHub Actions", test_github_actions),
        ("Data Files", test_data_files)
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"[FAIL] {test_name} test crashed: {e}")
            results.append((test_name, False))
    
    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "[PASS]" if result else "[FAIL]"
        print(f"{status}: {test_name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n[SUCCESS] All tests passed! GitHub API is ready for use.")
    else:
        print(f"\n[WARNING] {total - passed} test(s) failed. Please check the errors above.")
    
    print("=" * 60)

if __name__ == "__main__":
    main()
