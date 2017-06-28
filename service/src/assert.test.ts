import { expect } from 'chai';

import {
  assertOptional,
  assertValidString,
  createAssertValidObject
} from './assert';

describe('Assert', () => {

  interface TestItem {
    id: string;
    location?: string;
  }

  const assertValidTestItem = createAssertValidObject<TestItem>({
    id: assertValidString,
    location: assertOptional(assertValidString)
  });

  it('should throw if non-optional key does not exist on object being validated', () => {
    const obj: any = {
      location: 'abc'
    };
    expect(() => {
      assertValidTestItem(obj);
    }).to.throw('Invalid id undefined');
  });

  it('should not throw if optional key does not exist on object being validated', () => {
    const obj: any = {
      id: '123'
    };
    expect(() => {
      assertValidTestItem(obj);
    }).to.not.throw();
  });

  it('should throw if extra keys not defined on ObjectValidator exist on object being validated', () => {
    const obj: any = {
      id: '123',
      cost: 100
    };
    expect(() => {
      assertValidTestItem(obj);
    }).to.throw('Unexpected key(s) found on object: cost');
  });

  it('should throw if optional key is defined on object being validated but value is not of expected type', () => {
    const obj: any = {
      id: '123',
      location: 10
    };
    expect(() => {
      assertValidTestItem(obj);
    }).to.throw('Invalid location 10');
  });
});
