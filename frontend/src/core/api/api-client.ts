import { authEndpoints, examsEndpoints, usersEndpoints } from './endpoints';

export const apiClient = {
  auth: authEndpoints,
  users: usersEndpoints,
  exams: examsEndpoints,
};
