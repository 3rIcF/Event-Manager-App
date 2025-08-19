#!/bin/bash

# Event Manager API - Test Script
# This script tests all major API endpoints

set -e

BASE_URL="http://localhost:3001"
API_URL="$BASE_URL/api/v1"

echo "🚀 Event Manager API Test Suite"
echo "================================"
echo "Base URL: $BASE_URL"
echo "API URL: $API_URL"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local headers=$4
    local expected_status=$5
    local description=$6
    
    echo -n "Testing: $description ... "
    
    if [ -n "$data" ]; then
        if [ -n "$headers" ]; then
            response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X $method "$API_URL$endpoint" -H "Content-Type: application/json" -H "$headers" -d "$data")
        else
            response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X $method "$API_URL$endpoint" -H "Content-Type: application/json" -d "$data")
        fi
    else
        if [ -n "$headers" ]; then
            response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X $method "$API_URL$endpoint" -H "$headers")
        else
            response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X $method "$API_URL$endpoint")
        fi
    fi
    
    # Extract status code
    status=$(echo $response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    body=$(echo $response | sed -e 's/HTTPSTATUS:.*//g')
    
    if [ "$status" -eq "$expected_status" ]; then
        echo -e "${GREEN}✅ PASSED${NC} (Status: $status)"
        ((TESTS_PASSED++))
        
        # Extract and store tokens for authenticated requests
        if [[ "$endpoint" == "/auth/register" || "$endpoint" == "/auth/login" ]]; then
            ACCESS_TOKEN=$(echo $body | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
            if [ -n "$ACCESS_TOKEN" ]; then
                echo "  📝 Access Token: ${ACCESS_TOKEN:0:20}..."
            fi
        fi
    else
        echo -e "${RED}❌ FAILED${NC} (Expected: $expected_status, Got: $status)"
        echo "  Response: $body"
        ((TESTS_FAILED++))
    fi
}

echo "1. 🏥 Health Check Tests"
echo "----------------------"
test_endpoint "GET" "/health" "" "" 200 "API Health Check"
test_endpoint "GET" "" "" "" 200 "Root Endpoint"

echo ""
echo "2. 🔐 Authentication Tests"
echo "-------------------------"

# Test user registration
USER_DATA='{
  "email": "test@example.com",
  "username": "testuser",
  "password": "TestPassword123",
  "firstName": "Test",
  "lastName": "User"
}'

test_endpoint "POST" "/auth/register" "$USER_DATA" "" 201 "User Registration"

# Test user login
LOGIN_DATA='{
  "email": "test@example.com", 
  "password": "TestPassword123"
}'

test_endpoint "POST" "/auth/login" "$LOGIN_DATA" "" 200 "User Login"

# Test with invalid credentials
INVALID_LOGIN='{
  "email": "test@example.com",
  "password": "wrongpassword"
}'

test_endpoint "POST" "/auth/login" "$INVALID_LOGIN" "" 401 "Invalid Login"

echo ""
echo "3. 🔒 Protected Endpoint Tests"
echo "-----------------------------"

if [ -n "$ACCESS_TOKEN" ]; then
    AUTH_HEADER="Authorization: Bearer $ACCESS_TOKEN"
    
    test_endpoint "GET" "/auth/profile" "" "$AUTH_HEADER" 200 "Get User Profile"
    test_endpoint "GET" "/projects" "" "$AUTH_HEADER" 200 "Get Projects"
    test_endpoint "GET" "/tasks/my-tasks" "" "$AUTH_HEADER" 200 "Get My Tasks"
    test_endpoint "GET" "/suppliers" "" "$AUTH_HEADER" 200 "Get Suppliers"
    test_endpoint "GET" "/files" "" "$AUTH_HEADER" 200 "Get Files"
else
    echo -e "${YELLOW}⚠️  Skipping protected endpoint tests (no access token)${NC}"
fi

echo ""
echo "4. 📋 Project Management Tests"
echo "-----------------------------"

if [ -n "$ACCESS_TOKEN" ]; then
    # Create project
    PROJECT_DATA='{
      "name": "Test Event",
      "description": "Test event for API testing",
      "status": "PLANNING",
      "priority": "MEDIUM",
      "budget": 10000.00,
      "tags": ["Test", "API"]
    }'
    
    test_endpoint "POST" "/projects" "$PROJECT_DATA" "$AUTH_HEADER" 201 "Create Project"
    
    # Test project validation
    INVALID_PROJECT='{
      "name": "",
      "budget": -1000
    }'
    
    test_endpoint "POST" "/projects" "$INVALID_PROJECT" "$AUTH_HEADER" 400 "Invalid Project Data"
else
    echo -e "${YELLOW}⚠️  Skipping project tests (no access token)${NC}"
fi

echo ""
echo "5. 🏭 Supplier Tests"
echo "------------------"

if [ -n "$ACCESS_TOKEN" ]; then
    # Create supplier
    SUPPLIER_DATA='{
      "name": "Test Supplier",
      "contactPerson": "John Doe",
      "email": "john@testsupplier.com",
      "category": "Catering",
      "specialties": ["Event-Catering"]
    }'
    
    test_endpoint "POST" "/suppliers" "$SUPPLIER_DATA" "$AUTH_HEADER" 201 "Create Supplier"
    test_endpoint "GET" "/suppliers/categories" "" "$AUTH_HEADER" 200 "Get Supplier Categories"
    test_endpoint "GET" "/suppliers/top" "" "$AUTH_HEADER" 200 "Get Top Suppliers"
else
    echo -e "${YELLOW}⚠️  Skipping supplier tests (no access token)${NC}"
fi

echo ""
echo "6. ❌ Error Handling Tests"
echo "------------------------"
test_endpoint "GET" "/nonexistent" "" "" 404 "404 Not Found"
test_endpoint "GET" "/auth/profile" "" "" 401 "Unauthorized Access"

echo ""
echo "📊 Test Results"
echo "==============="
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo -e "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "\n${RED}❌ Some tests failed!${NC}"
    exit 1
fi