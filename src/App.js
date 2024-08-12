import React from "react";
import { HashRouter  as Router, Route, Routes } from "react-router-dom";
import TaskManagerPro from "./pages/TaskManagerPro";





const App = () => {
  return (

        <Router>
                        <Routes>
                          <Route path="/" element={<TaskManagerPro />} />

                        </Routes>
                     
        </Router>

  );
};

export default App;
