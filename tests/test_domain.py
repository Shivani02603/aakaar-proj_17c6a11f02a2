import pytest
from datetime import datetime, timedelta

def test_fr_001_register_returns_jwt(client):
    email = f"user_{datetime.utcnow().timestamp()}@example.com"
    password = "securepassword123"
    response = client.post("/api/auth/register", json={"email": email, "password": password})
    assert response.status_code == 201
    assert "access_token" in response.json()

def test_fr_002_login_returns_jwt(client):
    email = f"user_{datetime.utcnow().timestamp()}@example.com"
    password = "securepassword123"
    client.post("/api/auth/register", json={"email": email, "password": password})
    response = client.post("/api/auth/login", json={"email": email, "password": password})
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_fr_003_create_todo(client, auth_headers):
    todo_data = {
        "title": "Test Todo",
        "description": "This is a test todo",
        "due_date": (datetime.utcnow() + timedelta(days=1)).isoformat()
    }
    response = client.post("/api/todos", json=todo_data, headers=auth_headers)
    assert response.status_code == 201
    assert response.json()["title"] == todo_data["title"]
    assert response.json()["description"] == todo_data["description"]
    assert response.json()["due_date"] == todo_data["due_date"]

def test_fr_004_get_todos(client, auth_headers):
    unique_title = f"Todo {datetime.utcnow().timestamp()}"
    client.post("/api/todos", json={"title": unique_title, "description": "Test", "due_date": (datetime.utcnow() + timedelta(days=1)).isoformat()}, headers=auth_headers)
    response = client.get("/api/todos", headers=auth_headers)
    assert response.status_code == 200
    assert any(todo["title"] == unique_title for todo in response.json())

def test_fr_005_get_completed_todos(client, auth_headers):
    unique_title = f"Completed Todo {datetime.utcnow().timestamp()}"
    todo_data = {
        "title": unique_title,
        "description": "Test",
        "due_date": (datetime.utcnow() + timedelta(days=1)).isoformat(),
        "completed": True
    }
    response = client.post("/api/todos", json=todo_data, headers=auth_headers)
    assert response.status_code == 201
    response = client.get("/api/todos?completed=true", headers=auth_headers)
    assert response.status_code == 200
    assert all(todo["completed"] for todo in response.json())
    assert any(todo["title"] == unique_title for todo in response.json())

def test_fr_006_get_todo_by_id(client, auth_headers):
    todo_data = {
        "title": "Single Todo",
        "description": "Test",
        "due_date": (datetime.utcnow() + timedelta(days=1)).isoformat()
    }
    response = client.post("/api/todos", json=todo_data, headers=auth_headers)
    assert response.status_code == 201
    todo_id = response.json()["id"]
    response = client.get(f"/api/todos/{todo_id}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["title"] == todo_data["title"]

def test_fr_007_update_todo(client, auth_headers):
    todo_data = {
        "title": "Update Todo",
        "description": "Test",
        "due_date": (datetime.utcnow() + timedelta(days=1)).isoformat()
    }
    response = client.post("/api/todos", json=todo_data, headers=auth_headers)
    assert response.status_code == 201
    todo_id = response.json()["id"]
    updated_data = {
        "title": "Updated Title",
        "description": "Updated Description",
        "due_date": (datetime.utcnow() + timedelta(days=2)).isoformat(),
        "completed": True
    }
    response = client.put(f"/api/todos/{todo_id}", json=updated_data, headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["title"] == updated_data["title"]
    assert response.json()["completed"] == updated_data["completed"]

def test_fr_008_toggle_todo_completed(client, auth_headers):
    todo_data = {
        "title": "Toggle Todo",
        "description": "Test",
        "due_date": (datetime.utcnow() + timedelta(days=1)).isoformat(),
        "completed": False
    }
    response = client.post("/api/todos", json=todo_data, headers=auth_headers)
    assert response.status_code == 201
    todo_id = response.json()["id"]
    response = client.patch(f"/api/todos/{todo_id}", json={"completed": True}, headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["completed"] is True

def test_fr_009_delete_todo(client, auth_headers):
    todo_data = {
        "title": "Delete Todo",
        "description": "Test",
        "due_date": (datetime.utcnow() + timedelta(days=1)).isoformat()
    }
    response = client.post("/api/todos", json=todo_data, headers=auth_headers)
    assert response.status_code == 201
    todo_id = response.json()["id"]
    response = client.delete(f"/api/todos/{todo_id}", headers=auth_headers)
    assert response.status_code == 204
    response = client.get(f"/api/todos/{todo_id}", headers=auth_headers)
    assert response.status_code == 404