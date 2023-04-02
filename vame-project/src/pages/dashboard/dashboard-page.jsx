import React from "react";
import TopNavBar from "../../components/top-navbar/top-navbar"

export default function DashboardPage() {
    const [loading,setLoading] = React.useState(true);

    return (
        <>
            <TopNavBar loading={loading} setLoading={setLoading}/>
            {!loading && <h1>Welcome to Dashboard Page</h1>}
        </>
    );
  }