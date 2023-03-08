import React from "react";
import { createBrowserRouter,createRoutesFromElements,Route} from "react-router-dom";
import LandingPage from '../pages/landing/landing-page'
import ErrorPage from '../pages/error/error-page';
import LoginPage from '../pages/login/login-page';
import SignupPage from '../pages/signup/signup-page';

const router = createBrowserRouter(
    createRoutesFromElements(
      <Route>
        <Route path="/login" element={<LoginPage/>}/>
        <Route path ="/" element={<LandingPage/>}/>
        <Route path="/signup" element={<SignupPage/>}/>
        <Route path="*" element={<ErrorPage/>}/>
      </Route>
    )
    
);

export default router;