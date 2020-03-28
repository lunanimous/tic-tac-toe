export function areEqual(...args: any[]) {
  var len = args.length;
  for (var i = 1; i < len; i++) {
    if (args[i] === null || args[i] !== args[i - 1]) return false;
  }
  return true;
}
