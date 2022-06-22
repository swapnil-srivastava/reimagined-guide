import React from 'react';
import Metatags from '../../components/Metatags';

// e.g. localhost:3000/admin/page1
// e.g. localhost:3000/admin/page2

function AdminSlug() {
  return (
    <main>
      <Metatags title="admin page"></Metatags>
      <div>Edit Post</div>
    </main>
  )
}

export default AdminSlug