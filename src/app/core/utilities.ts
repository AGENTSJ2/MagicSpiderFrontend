export async function waitForMilliseconds(milliseconds: number) {
  await new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, milliseconds);
  });
}