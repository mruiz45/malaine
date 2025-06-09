# User Story Template - Project Malaine

## 📋 User Story [ID]: [Title]

### 1. METADATA
- **Story ID**: US_[number]
- **Epic**: [Parent epic if applicable]
- **Priority**: [Critical/High/Medium/Low]
- **Estimated Effort**: [XS/S/M/L/XL]
- **Dependencies**: [List other US IDs that must be completed first]

### 2. USER STORY STATEMENT
**As a** [type of user]  
**I want** [goal/desire]  
**So that** [benefit/value]

### 3. CONTEXT & BACKGROUND
[Provide any necessary context about why this story exists, what problem it solves, and how it fits into the larger system]

### 4. ACCEPTANCE CRITERIA ✅
**GIVEN** [precondition]  
**WHEN** [action]  
**THEN** [expected result]

- [ ] AC1: [Specific, testable criterion]
- [ ] AC2: [Specific, testable criterion]
- [ ] AC3: [Specific, testable criterion]

### 5. FUNCTIONAL REQUIREMENTS 📝

#### 5.1 UI Requirements
- **Page/Component**: [Exact location in the app]
- **Visual Elements**:
  - [ ] Element 1: [Description]
  - [ ] Element 2: [Description]
- **User Interactions**:
  - [ ] Interaction 1: [Click/Type/Select] → [Expected behavior]
  - [ ] Interaction 2: [Action] → [Result]

#### 5.2 Business Logic
- **Validation Rules**:
  - Rule 1: [Field/Condition] → [Validation]
  - Rule 2: [Field/Condition] → [Validation]
- **Calculations/Transformations**:
  - [If any specific calculations are needed]

#### 5.3 Data Requirements
- **Input Data**: [What data the user provides]
- **Output Data**: [What data is displayed/returned]
- **Data Persistence**: [What needs to be saved]

### 6. TECHNICAL SPECIFICATIONS 🔧

#### 6.1 Architecture References
- **Relevant Patterns**: [Reference specific patterns from architecture.md]
- **Existing Components to Reuse**: [List from architecture.md]
- **Existing Services/Helpers**: [List from architecture.md]

#### 6.2 Database Schema
```sql
-- Only include if new tables/columns are needed
-- NEVER modify existing schema unless explicitly required

CREATE TABLE IF NOT EXISTS [table_name] (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- columns
);
```

#### 6.2 API Endpoints
```typescript
// GET /api/[resource]/[action]
// Request: { params }
// Response: { data structure }

// POST /api/[resource]/[action]
// Request Body: { field1: type, field2: type }
// Response: { success: boolean, data?: type }
```

#### 6.3 Components to Create/Modify
- **NEW Components**:
  - `ComponentName.tsx`: [Purpose and location]
- **EXISTING Components to Modify**:
  - `ExistingComponent.tsx`: [Specific changes needed]
  - ⚠️ **ONLY modify the parts mentioned below**:
    - Line XX-YY: [Change description]

#### 6.4 Services/Contexts to Update
- **Service**: `serviceName.ts`
  - New Method: `methodName()` - [Purpose]
- **Context**: `ContextName.tsx`
  - New State: `stateName` - [Purpose]

### 7. IMPLEMENTATION CONSTRAINTS ⚠️

#### 7.1 DO NOT MODIFY
- [ ] List all files/components that should NOT be touched
- [ ] Existing functionality that must remain intact

#### 7.2 MUST REUSE (from architecture.md)
- [ ] Existing component: `ComponentName` for [purpose]
- [ ] Existing service: `serviceName.methodName()` for [purpose]
- [ ] Existing styles: `className` from [file]
- [ ] Existing pattern: [Pattern name] as documented in architecture.md

#### 7.3 TECHNICAL CONSTRAINTS
- Must follow the Page → Service → API → Supabase pattern
- Must use `getSupabaseSessionApi` for authenticated endpoints
- Must handle all error cases
- Must maintain existing functionality
- Must follow conventions documented in architecture.md

### 8. TESTING SCENARIOS 🧪

#### 8.1 Happy Path
1. [Step 1]: User action → Expected result
2. [Step 2]: User action → Expected result

#### 8.2 Error Cases
1. **Invalid Input**: [Scenario] → [Error message/behavior]
2. **Network Error**: [Scenario] → [Error handling]
3. **Unauthorized**: [Scenario] → [Redirect/message]

#### 8.3 Edge Cases
1. [Edge case scenario] → [Expected behavior]

### 9. IMPLEMENTATION NOTES 📌

#### 9.1 Specific Instructions
- Use existing [component/pattern] from [location]
- Follow the pattern established in [reference file]
- Ensure compatibility with [existing feature]

#### 9.2 Performance Considerations
- [Any specific performance requirements]

#### 9.3 Security Considerations
- [Any specific security requirements]

### 10. DELIVERABLES 📦

#### 10.1 Code Deliverables
- [ ] Component(s): [List]
- [ ] API Endpoint(s): [List]
- [ ] Service Method(s): [List]
- [ ] Database Migration: [If applicable]

#### 10.2 Testing Deliverables
- [ ] Manual test execution evidence
- [ ] All acceptance criteria verified
- [ ] No console errors
- [ ] Existing functionality verified

#### 10.3 Documentation
- [ ] Implementation notes in `./implementation/US_[number]_implementation.md`
- [ ] How to test: Step-by-step guide for validation

### 11. VALIDATION CHECKLIST ✓

Before considering this story complete:
- [ ] All acceptance criteria met
- [ ] No unrelated code modified
- [ ] All error cases handled
- [ ] UI matches requirements exactly
- [ ] API follows authentication pattern
- [ ] Existing tests still pass
- [ ] New functionality manually tested
- [ ] Implementation documented

---

**⚠️ REMINDER**: Only implement what is explicitly described in this User Story. Do not add extra features, refactor unrelated code, or modify working functionality.