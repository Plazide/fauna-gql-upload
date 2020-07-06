import wait from '../util/wait';

test('Should wait about 500 ms', async () => {
  const waitTime = 500;
  const time = Date.now();
  await wait(waitTime);
  const newTime = Date.now();
  expect(newTime).toBeGreaterThanOrEqual(time + waitTime);
  expect(newTime).toBeLessThan(time + waitTime + 5);
});
