#!/usr/bin/env node
// Minimal Linear API helper for CI (where the Linear MCP server isn't signed in).
//   node scripts/linear.mjs get ABC-123             -> prints the ticket as JSON
//   node scripts/linear.mjs comment ABC-123 "text"  -> posts a comment on the ticket
// Needs LINEAR_API_KEY (Linear → Settings → Security & access → Personal API keys).

const [cmd, id, ...rest] = process.argv.slice(2);
const key = process.env.LINEAR_API_KEY;
if (!key) fail("LINEAR_API_KEY is not set");
if (!["get", "comment"].includes(cmd) || !/^[A-Z][A-Z0-9]*-\d+$/.test(id ?? "")) {
  fail('usage: linear.mjs get ABC-123 | linear.mjs comment ABC-123 "text"');
}

async function gql(query, variables) {
  const res = await fetch("https://api.linear.app/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: key },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (!res.ok || json.errors) fail(JSON.stringify(json.errors ?? json));
  return json.data;
}

const { issue } = await gql(
  `query($id: String!) { issue(id: $id) {
     id identifier title description url branchName priorityLabel
     state { name } labels { nodes { name } }
     comments { nodes { body user { name } createdAt } }
     attachments { nodes { title url } }
   } }`,
  { id },
);

if (cmd === "get") {
  console.log(JSON.stringify(issue, null, 2));
} else {
  const body = rest.join(" ").trim();
  if (!body) fail("comment text is empty");
  await gql(`mutation($input: CommentCreateInput!) { commentCreate(input: $input) { success } }`, {
    input: { issueId: issue.id, body },
  });
  console.log(`Commented on ${issue.identifier}`);
}

function fail(msg) {
  console.error(msg);
  process.exit(1);
}
