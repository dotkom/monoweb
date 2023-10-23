import crypto from 'crypto';
import { beforeEach, describe, expect, it } from 'vitest';
import { ulid } from 'ulid';
import { createServiceLayer, ServiceLayer } from "../../core"
import { createEnvironment } from "@dotkomonline/env"
import { createKysely } from "@dotkomonline/db"

describe('users', () => {
  let core: ServiceLayer;

  beforeEach(async () => {
    const env = createEnvironment()
    const db = createKysely(env)
    core = await createServiceLayer({ db });
  });

  it('can create new users', async () => {
    const none = await core.userService.getAllUsers(100);
    expect(none).toHaveLength(0);

    const user = await core.userService.createUser({
      cognitoSub: crypto.randomUUID(),
    });

    const users = await core.userService.getAllUsers(100);
    expect(users).toContainEqual(user);
  });

  it('will not allow two users the same subject', async () => {
    const subject = crypto.randomUUID();
    const first = await core.userService.createUser({
      cognitoSub: subject,
    });
    expect(first).toBeDefined();
    await expect(
      core.userService.createUser({
        cognitoSub: subject,
      }),
    ).rejects.toThrow();
  });

  it('will find users by their user id', async () => {
    const user = await core.userService.createUser({
      cognitoSub: crypto.randomUUID(),
    });

    const match = await core.userService.getUser(user.id);
    expect(match).toEqual(user);
    const fail = await core.userService.getUser(ulid());
    expect(fail).toBeUndefined();
  });

  it('can update users given their id', async () => {
    await expect(
      core.userService.updateUser(ulid(), {
        cognitoSub: crypto.randomUUID(),
      }),
    ).rejects.toThrow();
    const user = await core.userService.createUser({
      cognitoSub: crypto.randomUUID(),
    });
    const updated = await core.userService.updateUser(user.id, {
      cognitoSub: crypto.randomUUID(),
    });
    expect(updated.cognitoSub).not.toEqual(user.cognitoSub);
  });
});