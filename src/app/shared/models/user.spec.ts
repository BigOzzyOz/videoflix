import { UserApiData } from '../interfaces/user-api-data';
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
});
