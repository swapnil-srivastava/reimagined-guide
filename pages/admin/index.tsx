import React from 'react'
import AuthCheck from '../../components/AuthCheck'

// e.g. localhost:3000/admin

function Admin() {
  return (
    <AuthCheck></AuthCheck>
  )
}

export default Admin