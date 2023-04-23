import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

// Supabase
import { supaClient } from "../../supa-client";

// React Components
import AuthCheck from "../../components/AuthCheck";
import PostFeed from "../../components/PostFeed";

// Interfaces
import { POST } from "../../database.types";
import { RootState } from "../../lib/interfaces/interface";
import { User } from "@supabase/supabase-js";

function ApproveSlug() {
  return <>Approve Slug</>;
}
export default ApproveSlug;
