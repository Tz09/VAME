import React from "react";
import { createBrowserRouter,createRoutesFromElements,Route} from "react-router-dom";
import LandingPage from '../pages/landing/landing-page'
import ErrorPage from '../pages/error/error-page';
import LoginPage from '../pages/login/login-page';
import AccountManagementPage from "../pages/account-management/account-management-page";

const router = createBrowserRouter(
    createRoutesFromElements(
      <Route>
        <Route path="/login" element={<LoginPage/>}/>
        <Route path ="/" element={<LandingPage/>}/>
        <Route path="/accountmanagement" element={<AccountManagementPage/>}/>
        <Route path="*" element={<ErrorPage/>}/>
      </Route>
    )
);

export default router;