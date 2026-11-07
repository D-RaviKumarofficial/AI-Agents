// Keep route transitions cancellable: a newer route always wins.
export function createRouteTransition({setBusy,delayMs=650,wait=ms=>new Promise(resolve=>setTimeout(resolve,ms))}) {
  let generation=0;
  return {
    async run(render) {
      const ticket=++generation;
      setBusy(true);
      try {
        await wait(delayMs);
        if(ticket!==generation)return false;
        await render();
        return ticket===generation;
      } finally {
        if(ticket===generation)setBusy(false);
      }
    },
    cancel() {generation++;setBusy(false);}
  };
}
