export const ok = <T>(data: T) => ({
  success: true,
  data,
});

export const fail = (message: string, status = 400) => ({
  success: false,
  message,
  status,
});
