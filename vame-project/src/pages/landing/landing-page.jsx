import React from "react";
import TopNavBar from "../../components/top-navbar/top-navbar"

export default function LandingPage() {
    const [loading,setLoading] = React.useState(true);

    return (
        <>
            <TopNavBar loading={loading} setLoading={setLoading}/>
            {!loading && <img src="http://127.0.0.1:5000/streaming" width="50%"/>}
        </>
    );
  }