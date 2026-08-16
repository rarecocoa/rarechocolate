# Rare Cocoa Store Development Rules

## 1. Exact Product Matching
- NEVER use loose substring checks like `name.includes('hazelnut')` when modifying specific product rules.
- ALWAYS use exact product name matches (e.g. `name.toLowerCase() === 'hazelnut spread'`) to avoid accidentally modifying sibling products like `Hazelnut Cluster` or `Hazelnut Cranberry Tablet`.

## 2. Strict Change Scoping
- ONLY modify sweetener choices, price multipliers, or quantity options for products explicitly named in the request.
- All other products must remain on their standard default pricing and options.

## 3. No Browser Automation or Local Port Scanning
- DO NOT invoke browser subagents or execute local port scanning scripts.
- Perform all workspace updates through direct file edits (`replace_file_content`) and terminal commands (`run_command`).

## 4. Mandatory Automated Verification
- ALWAYS run a python test suite before completing a turn to verify:
  1. The requested product rules match 100%.
  2. No surrounding products in the store were altered.
