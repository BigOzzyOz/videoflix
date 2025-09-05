import { UserApiData } from '../interfaces/user-api-data';
import { UserData } from '../interfaces/user-data';
import { User } from './user';

describe('User', () => {
  const mockData: UserApiData = {
    id: '1',
    username: 'testuser',
    email: 'testuser@test.de',
    role: 'user',
    first_name: 'Test',
    last_name: 'User',
    profiles: []
  }
  it('should create an instance', () => {
    expect(new User(mockData)).toBeTruthy();
  });

  it('should create from UserData', () => {
    const data: UserData = {
      id: '2',
      username: 'otheruser',
      email: 'other@example.com',
      role: 'user',
      firstName: 'Other',
      lastName: 'User',
      profiles: [],
    };
    const user = new User(data);
    expect(user.id).toBe('2');
    expect(user.username).toBe('otheruser');
    expect(user.email).toBe('other@example.com');
    expect(user.role).toBe('user');
    expect(user.firstName).toBe('Other');
    expect(user.lastName).toBe('User');
  });

  it('should return full name or username', () => {
    const data: UserData = {
      id: '2',
      username: 'otheruser',
      email: 'other@example.com',
      role: 'user',
      firstName: 'Other',
      lastName: 'User',
      profiles: [],
    };
    const user = new User(data);
    expect(user.getFullName()).toBe('Other User');
    user.firstName = '';
    user.lastName = '';
    expect(user.getFullName()).toBe('otheruser');
  });

  it('should return profile by id or null', () => {
    const data: UserData = {
      id: '2',
      username: 'otheruser',
      email: 'other@example.com',
      role: 'user',
      firstName: 'Other',
      lastName: 'User',
      profiles: [],
    };
    const user = new User(data);
    expect(user.getProfileById('notfound')).toBeNull();
  });

  it('should return default profile or null', () => {
    const data: UserData = {
      id: '2',
      username: 'otheruser',
      email: 'other@example.com',
      role: 'user',
      firstName: 'Other',
      lastName: 'User',
      profiles: [],
    };
    const user = new User(data);
    expect(user.getDefaultProfile()).toBeNull();
  });

  it('should convert to API format', () => {
    const data: UserData = {
      id: '2',
      username: 'otheruser',
      email: 'other@example.com',
      role: 'user',
      firstName: 'Other',
      lastName: 'User',
      profiles: [],
    };
    const user = new User(data);
    const apiFormat = user.toApiFormat();
    expect(apiFormat.id).toBe('2');
    expect(apiFormat.username).toBe('otheruser');
    expect(apiFormat.email).toBe('other@example.com');
    expect(apiFormat.role).toBe('user');
    expect(apiFormat.first_name).toBe('Other');
    expect(apiFormat.last_name).toBe('User');
    expect(Array.isArray(apiFormat.profiles)).toBeTrue();
  });

  it('should create an empty user', () => {
    const empty = User.empty();
    expect(empty.id).toBe('');
    expect(empty.username).toBe('');
    expect(empty.email).toBe('');
    expect(empty.role).toBe('user');
    expect(empty.firstName).toBe('');
    expect(empty.lastName).toBe('');
    expect(empty.profiles.length).toBe(0);
  });
});
