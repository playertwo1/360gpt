import { routeDirector } from './director-router.mjs';
import { compareShadow } from '../shadow/shadow-runner.mjs';

export function executeShadowPair({ request, baseline, candidate, releaseId, observedAt }) {
  const routing = routeDirector(request);
  if (routing.decision_status !== 'READY') {
    return { mode: 'OFFLINE_EVAL', routing, status: 'MANUAL_REVIEW_REQUIRED' };
  }
  const input = { ...request, routing };
  const baselineOutput = baseline(input);
  const candidateOutput = candidate(input);
  return {
    status: 'COMPLETED',
    routing,
    comparison: compareShadow({ input, baseline: baselineOutput, candidate: candidateOutput, releaseId, observedAt })
  };
}
