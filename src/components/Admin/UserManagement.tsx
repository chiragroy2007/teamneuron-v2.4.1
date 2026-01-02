import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

interface UserProfile {
  id: string;
  user_id: string;
  username: string;
  full_name?: string;
  email?: string;
  avatar_url?: string;
  role?: string | null;
}

const PAGE_SIZE = 5;

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchUsers(1, search, true);
    // eslint-disable-next-line
  }, [search]);

  const fetchUsers = async (pageNum: number, searchTerm = '', reset = false) => {
    setLoading(true);
    try {
      const data = await api.users.list(PAGE_SIZE, (pageNum - 1) * PAGE_SIZE, searchTerm);
      if (data) {
        setUsers(reset ? data : users.concat(data));
        setHasMore(data.length === PAGE_SIZE);
        setPage(pageNum);
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleShowMore = () => {
    fetchUsers(page + 1, search);
  };

  const handleDeleteUser = async (user: UserProfile) => {
    if (!window.confirm(`Are you sure you want to permanently delete user ${user.username}?`)) return;
    setLoading(true);

    try {
      await api.users.delete(user.user_id); // Assuming ID is user_id

      setUsers(users.filter(u => u.user_id !== user.user_id));
      alert('User deleted successfully.');

    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Search by username"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>
      <ul className="divide-y divide-gray-200">
        {users.map(user => (
          <li key={user.user_id} className="flex items-center justify-between py-2">
            <span className="font-medium">{user.full_name || user.username || user.user_id}</span>
            <span className="text-xs text-gray-400 ml-2">{user.email || ''}</span>
            <Button variant="destructive" size="sm" onClick={() => handleDeleteUser(user)} disabled={loading}>
              Delete
            </Button>
          </li>
        ))}
      </ul>
      {hasMore && (
        <Button variant="outline" className="mt-4" onClick={handleShowMore} disabled={loading}>
          Show More
        </Button>
      )}
      {loading && <div className="mt-2 text-xs text-gray-500">Loading...</div>}
    </div>
  );
};

export default UserManagement;
