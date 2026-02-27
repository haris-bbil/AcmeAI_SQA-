export type CoreTestingMode = 'query' | 'upload' | 'server-validation';

export type CoreTestingCase = {
  requirementId: string;
  testCaseId: string;
  description: string;
  expectedResult: string;
  payload?: string;
  mode: CoreTestingMode;
};
