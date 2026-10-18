/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type Bus = {
  __typename?: 'Bus';
  id: Scalars['ID']['output'];
  lat: Scalars['Float']['output'];
  lng: Scalars['Float']['output'];
  name: Scalars['String']['output'];
};

export type Line = {
  __typename?: 'Line';
  coords: Array<Array<Scalars['Float']['output']>>;
  from: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  /** Loading % of rating, one value per scenario (same order as 'scenarios') */
  loading: Array<Scalars['Float']['output']>;
  name: Scalars['String']['output'];
  to: Scalars['ID']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  runStudy: StudyRun;
};


export type MutationRunStudyArgs = {
  projectId: Scalars['ID']['input'];
};

export type Project = {
  __typename?: 'Project';
  busId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  upgrades: Array<Upgrade>;
};

export type Query = {
  __typename?: 'Query';
  buses: Array<Bus>;
  lines: Array<Line>;
  projects: Array<Project>;
  scenarios: Array<Scenario>;
};

export type Scenario = {
  __typename?: 'Scenario';
  id: Scalars['ID']['output'];
  label: Scalars['String']['output'];
  short: Scalars['String']['output'];
};

export type StudyProgress = {
  __typename?: 'StudyProgress';
  done: Scalars['Boolean']['output'];
  percent: Scalars['Int']['output'];
  runId: Scalars['ID']['output'];
  stage: Scalars['String']['output'];
};

export type StudyRun = {
  __typename?: 'StudyRun';
  id: Scalars['ID']['output'];
  projectId: Scalars['ID']['output'];
};

export type Subscription = {
  __typename?: 'Subscription';
  studyProgress: StudyProgress;
};


export type SubscriptionStudyProgressArgs = {
  runId: Scalars['ID']['input'];
};

export type Upgrade = {
  __typename?: 'Upgrade';
  costM: Scalars['Float']['output'];
  defaultOn: Scalars['Boolean']['output'];
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  lineId: Scalars['ID']['output'];
};

export type RunStudyMutationVariables = Exact<{
  projectId: string | number;
}>;


export type RunStudyMutation = { runStudy: { id: string } };

export type StudyQueryVariables = Exact<{ [key: string]: never; }>;


export type StudyQuery = { scenarios: Array<{ id: string, label: string, short: string }>, buses: Array<{ id: string, name: string, lng: number, lat: number }>, lines: Array<{ id: string, name: string, from: string, to: string, coords: Array<Array<number>>, loading: Array<number> }>, projects: Array<{ id: string, name: string, busId: string, upgrades: Array<{ id: string, lineId: string, description: string, costM: number, defaultOn: boolean }> }> };

export type StudyProgressSubscriptionVariables = Exact<{
  runId: string | number;
}>;


export type StudyProgressSubscription = { studyProgress: { percent: number, stage: string, done: boolean } };
