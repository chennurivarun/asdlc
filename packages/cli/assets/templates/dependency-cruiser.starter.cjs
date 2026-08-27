/**
 * STARTER boundary rules — only universally-safe checks are active.
 * Real boundary rules must be derived from docs/ARCHITECTURE.md after human
 * review (GOVERN): add `not-reachable-from`/`not-to` rules that encode the
 * homes and boundaries that document approves. Do not let a tool prescribe
 * your architecture.
 */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'Circular dependencies make consumer sweeps and staged migrations unreliable.',
      from: {},
      to: { circular: true },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    exclude: { path: '\\.(test|spec)\\.[jt]sx?$' },
    tsPreCompilationDeps: true,
  },
};
