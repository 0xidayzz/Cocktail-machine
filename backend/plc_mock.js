// backend/plc_mock.js
let state = 0;      // 0 idle, 1 running, 2 done, 3 error
let progress = 0;
let jobId = 0;
let timer = null;

export async function sendJob({ job_id }) {
  jobId = job_id;
  state = 1;
  progress = 0;

  if (timer) clearInterval(timer);

  timer = setInterval(() => {
    progress += 5;
    if (progress >= 100) {
      progress = 100;
      state = 2;
      clearInterval(timer);
      timer = null;
    }
  }, 250);

  return true;
}

export async function readStatus() {
  return {
    state,
    progress,
    step: state === 1 ? 1 : 0,
    error_code: 0,
    current_job_id: jobId
  };
}
