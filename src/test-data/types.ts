export type CoreTestingMode = 'query' | 'upload' | 'server-validation';

export type CoreTestingCase = {
  requirementId: string;
  testCaseId: string;
  description: string;
  expectedResult: string;
  payload?: string;
  mode: CoreTestingMode;
};

export type PostmanHeader = {
  key: string;
  value: string;
};

export type PostmanRequestCase = {
  name: string;
  method: string;
  url: string;
  headers: PostmanHeader[];
  body?: unknown;
};
