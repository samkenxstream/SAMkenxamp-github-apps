/**
 * Copyright 2020 The AMP HTML Authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {createTokenAuth} from '@octokit/auth';
import nock from 'nock';
import {Octokit} from '@octokit/rest';

import {getFixture} from './fixtures';
import {GitHub} from '../src/github';

describe('GitHub interface', () => {
  const githubClient: Octokit = new Octokit({
    authStrategy: createTokenAuth,
    auth: '_TOKEN_',
  });
  let github: GitHub;

  beforeAll(() => {
    nock.disableNetConnect();
  });

  afterAll(() => {
    nock.enableNetConnect();
  });

  beforeEach(() => {
    github = new GitHub(githubClient, 'test_org');
  });

  afterEach(() => {
    // Fail the test if there were unused nocks.
    if (!nock.isDone()) {
      throw new Error('Not all nock interceptors were used!');
      nock.cleanAll();
    }
  });

  describe('inviteUser', () => {
    it('PUTs to /orgs/:org/memberships/:username', async done => {
      nock('https://api.github.com')
        .put('/orgs/test_org/memberships/someone')
        .reply(200, getFixture('add_member.exists'));

      await github.inviteUser('someone');
      done();
    });

    it('returns true when the user is invited', async done => {
      nock('https://api.github.com')
        .put('/orgs/test_org/memberships/someone')
        .reply(200, getFixture('add_member.invited'));

      expect(await github.inviteUser('someone')).toBe(true);
      done();
    });

    it('returns false when the user is already a member', async done => {
      nock('https://api.github.com')
        .put('/orgs/test_org/memberships/someone')
        .reply(200, getFixture('add_member.exists'));

      expect(await github.inviteUser('someone')).toBe(false);
      done();
    });
  });

  describe('addComment', () => {
    it('POSTs comment to /repos/:owner/:repo/issues/:issue_number/comments', async done => {
      nock('https://api.github.com')
        .post('/repos/test_org/test_repo/issues/1337/comments', body => {
          expect(body).toEqual({body: 'Test comment'});
          return true;
        })
        .reply(200);

      await github.addComment('test_repo', 1337, 'Test comment');
      done();
    });
  });

  describe('assignIssue', () => {
    it('POSTs assignee to /repos/:owner/:repo/issues/:issue_number/assignees', async done => {
      nock('https://api.github.com')
        .post('/repos/test_org/test_repo/issues/1337/assignees', body => {
          expect(body).toEqual({assignees: ['someone']});
          return true;
        })
        .reply(200);

      await github.assignIssue('test_repo', 1337, 'someone');
      done();
    });
  });
});
