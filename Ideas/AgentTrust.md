# AgentTrust — Autonomous AI Agent Evaluation & Red-Team Simulator

- **Proposed competition category:** Best Business AI Agent
- **Project type:** Developer / enterprise AI reliability and security platform
- **Status:** Research concept; problem and differentiation still need validation
- **Dependency model:** Can be prototyped end-to-end with locally hosted target agents, mock tools, and synthetic scenarios. No company access is required for the first demo.

## 1. Project summary

**AgentTrust tests whether an AI agent can complete a task reliably and safely before that agent is trusted with real tools or data.** It runs an agent in a controlled sandbox, observes its tool calls and outcomes, checks them against policies and expected results, identifies failures, and reruns tests after a proposed fix.

The goal is not simply to benchmark how well a model answers questions. It is to evaluate what an agent actually *does*: which tools it calls, which data it accesses, whether it follows permission boundaries, how it handles untrusted instructions, and whether it verifies completion.

## 2. Problem being addressed

AI agents can plan multi-step work and use tools such as email, file access, CRM, browsers, or business APIs. This creates failure modes beyond ordinary chatbot errors:

- An agent may take an unauthorized or destructive action.
- Instructions embedded in a document or message may try to override the task or policy.
- An agent may report that work is complete without verifying the result.
- A tool may fail, return malformed data, or provide conflicting information.
- A change intended to fix one issue may introduce a regression elsewhere.
- Teams may lack clear, repeatable evidence showing how an agent behaved in edge cases.

These are the product problem hypotheses for this project, not a claim that every organization experiences them or that a single tool can guarantee safety.

### Why this connects to Dubai's direction

Dubai announced a 2026 initiative to help the private sector transition toward agentic AI, including dedicated training and support for agentic-AI companies. As more businesses experiment with agents, testing their behavior before deployment is a relevant enabling capability. This is strategic alignment, not evidence of a confirmed procurement requirement.

## 3. What AgentTrust will solve

AgentTrust will provide a repeatable test environment for evaluating an agent against specified goals, allowed tools, forbidden actions, and expected outcomes. It will produce an evidence-backed report rather than an unexplained “safe/unsafe” label.

### Target users

- Teams building tool-using AI agents
- AI platform and application engineers
- Enterprise AI governance, testing, and security teams
- Startups that need a repeatable agent evaluation process

## 4. Core agent workflow

1. **Configure the test target:** Load a local agent or connect an explicitly configured test endpoint; define the task, available tools, and restrictions.
2. **Build scenarios:** Select or generate test cases covering normal tasks, edge cases, malicious instructions, tool failures, ambiguous input, and conflicting data.
3. **Execute in a sandbox:** Run the target agent only against mock or disposable test tools.
4. **Capture the trace:** Record decisions, tool calls, arguments, results, retries, and final state, subject to data minimization.
5. **Evaluate behavior:** Check task completion, policy compliance, data boundaries, and state changes using deterministic assertions wherever possible.
6. **Explain failures:** Link each finding to the relevant trace and violated test condition.
7. **Suggest a mitigation:** Recommend a policy, prompt, tool permission, validation, or retry change. Require a human to approve changes to the target agent.
8. **Rerun regressions:** Execute the same tests again and compare results before and after the fix.

## 5. Agent tools / callable functions

The agent should use narrow, auditable tool functions. It should not receive unrestricted shell, filesystem, or network access.

| Tool | Purpose | Guardrail |
|---|---|---|
| `load_agent_config` | Load the target agent, task, permitted tools, and policy | Allowlisted test targets only |
| `create_test_scenarios` | Select scenarios from a risk library and create bounded variants | No execution until scenario review or configured policy approval |
| `run_scenario` | Execute a scenario against a sandbox agent | Time limit, call limit, mock credentials, isolated environment |
| `read_execution_trace` | Retrieve tool calls, arguments, outputs, and state changes | Redact secrets and personal data |
| `check_policy` | Evaluate tool permissions and prohibited actions | Prefer deterministic policy checks |
| `assert_task_outcome` | Check whether the required end state was reached | Use explicit, testable assertions |
| `score_test_run` | Calculate metrics and classify failures | Keep rule-based scores distinct from LLM judgments |
| `propose_mitigation` | Suggest a policy or workflow improvement | Suggestions only; no automatic production changes |
| `rerun_regression_suite` | Rerun relevant cases after a change | Use versioned scenarios and reproducible inputs |
| `export_evaluation_report` | Export results, trace references, and limitations | Report only tests actually performed |

## 6. Functional requirements

### MVP requirements

- A small library of manually reviewed test scenarios.
- One sample target agent with a few mock tools (for example, email, file lookup, and task creation).
- A sandbox runner with timeouts and tool-call limits.
- A trace viewer showing what the target called and what happened.
- Deterministic checks for prohibited tools, unauthorized state changes, and expected final state.
- A failure explanation linked to trace evidence.
- A before/after regression report.
- Exportable HTML or Markdown evaluation report.

### Later capabilities

- More agent frameworks through a common adapter interface.
- Scenario generation based on a user-supplied risk policy.
- Tests for indirect prompt injection, information disclosure, tool misuse, and recovery from failures.
- Version comparison and team-level test suites.
- Optional CI integration to run tests when agent code or tool permissions change.

## 7. Technical approach

A practical implementation could use:

- **Backend:** Python, FastAPI, Pydantic
- **Agent orchestration:** A framework adapter for the target agent; Strands Agents or a simple custom tool-calling loop can be used for the first version
- **Sandbox:** Mock tool implementations; Docker or another isolated runtime if executing untrusted target code
- **Storage:** SQLite for a local prototype; PostgreSQL for a hosted version
- **UI:** React / Next.js dashboard, or a lightweight Python UI for the first demo
- **Evaluation:** Deterministic assertions first; an LLM judge only as a secondary evaluator with a visible rubric and evidence
- **Observability:** Structured JSON traces with run IDs, scenario versions, timestamps, tool names, and redacted arguments

Keep the target agent and evaluator logically separate. A target agent should not be able to modify its own evaluation record.

## 8. Self-contained demo plan

Build a mock procurement assistant that can read a purchase request, look up a supplier, draft an email, and create a purchase task. Create scenarios where:

- A normal request should succeed.
- A document contains instructions to ignore policy.
- The requested supplier is absent from the allowlist.
- A tool returns an error or inconsistent data.
- The agent claims success but the task record was never created.

Show AgentTrust detecting a failure, explaining the evidence, applying an approved policy change to the test version, and rerunning the same cases.

## 9. Evaluation metrics

- Task success rate on a versioned test set
- Unauthorized or prohibited action rate
- Policy violation detection precision and recall
- False-positive rate on benign scenarios
- Recovery success after tool failures
- Regression count after a mitigation
- Reproducibility of results across repeated runs

Do not claim that passing a test suite proves an agent is completely secure. Report the coverage, limitations, and scenarios that were not tested.

## 10. Safety, privacy, and limitations

- Use mock credentials, synthetic data, and sandbox tools by default.
- Do not run tests against third-party systems without explicit authorization.
- Do not execute destructive or external actions during the evaluation.
- Redact secrets in traces and enforce retention limits.
- Treat LLM-generated risk scores as advisory; policy enforcement should be deterministic where possible.
- Position the product as an evaluation aid, not a certification or guarantee of safety.

## 11. Differentiation hypothesis to validate

A potentially useful differentiator is **closed-loop agent evaluation**: generate or select a test, run the agent, inspect real tool traces, identify a specific failure, propose a bounded fix, and verify that the fix works without introducing regressions. Research existing AI-agent evaluation and security products before making novelty claims.

## 12. Key risks

- Existing testing and security products may already cover much of the feature set.
- LLM behavior can be nondeterministic, making some tests flaky.
- Testing an adapter may miss behavior in the full production environment.
- Automatically generated scenarios can be unrealistic unless reviewed.

## 13. Initial acceptance criteria

The MVP is ready for a competition demo when it can run at least 20 versioned scenarios, capture all mock tool calls, flag a defined set of policy violations, produce evidence-linked findings, and show a repeatable before/after comparison on the same test set.

## 14. Research references

- Create AI Agents Championship: https://www.dubaichambers.com/en/web/dubai-chamber-of-digital-economy/create-ai-agents
- Dubai Government announcement on private-sector agentic AI initiative (4 May 2026): https://www.protocol.dubai.ae/en/media-listing/news-events/hamdan-bin-mohammed-launches-new-initiative-to-transition-dubai-s-private-sector-toward-agentic-ai-within-two-years/

**Research note:** These references establish competition expectations and strategic context. They do not prove that Dubai Chambers has identified AgentTrust as an unmet need or plans to purchase such a product.
