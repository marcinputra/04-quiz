import { Routes, Route } from "react-router-dom";
import StartQuiz from "./component/StartQuiz";
import { lazy, Suspense, useEffect, useState } from "react";
import Quiz from "./component/Quiz";
import Header from "./component/Header";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Account from "./pages/Account";
import Home from "./pages/Home";
import ArticlePage from "./pages/ArticlePage";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import CookiePolicy from "./pages/CookiePolicy";
import CookieNotice from "./component/CookieNotice";
import CoursesList from "./pages/courses/CoursesList";
import CoursePage from "./pages/courses/CoursePage";
import LessonPage from "./pages/courses/LessonPage";
import MyResults from "./pages/MyResults";
import AttemptDetails from "./pages/AttemptDetails";
import { RequireAuth, RequireAdmin } from "./auth/RequireAuth";
import { useAuth } from "./auth/AuthContext";
import { api } from "./api";

// panel admina (z edytorami) ładuje się osobno — uczniowie go nie pobierają
const AdminHome = lazy(() => import("./pages/AdminHome"));
const AdminQuizList = lazy(() => import("./pages/admin/AdminQuizList"));
const AdminQuizEdit = lazy(() => import("./pages/admin/AdminQuizEdit"));
const AdminArticleList = lazy(() => import("./pages/admin/AdminArticleList"));
const AdminArticleEdit = lazy(() => import("./pages/admin/AdminArticleEdit"));
const AdminCourseList = lazy(() => import("./pages/admin/AdminCourseList"));
const AdminCourseEdit = lazy(() => import("./pages/admin/AdminCourseEdit"));
const AdminEnrollments = lazy(() => import("./pages/admin/AdminEnrollments"));

function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quizzes, setQuizzes] = useState([]);

  const { user } = useAuth();

  // lista quizów z API (po zalogowaniu mogą dojść quizy z kursów, więc odświeżamy przy zmianie konta)
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    api("/quizzes")
      .then((data) => !cancelled && setQuizzes(data))
      .catch((err) => !cancelled && setError(err.message || "Błąd podczas wczytywania quizów"))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  // lista quizów potrzebna tylko na stronach z quizami
  const quizPage = (element) => {
    if (loading) return <p className="mzi-auth-loading">Ładowanie...</p>;
    if (error) return <p className="mzi-auth-loading" style={{ color: "#f3a5a5" }}>{error}</p>;
    return element;
  };

  return (
    <>
      <Header />
      <Suspense fallback={<p className="mzi-auth-loading">Ładowanie...</p>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/artykuly/:slug" element={<ArticlePage />} />
        <Route path="/quizy" element={quizPage(<StartQuiz listQuiz={quizzes} />)} />
        <Route
          path="/quiz/:id"
          element={
            <RequireAuth>
              <Quiz />
            </RequireAuth>
          }
        />
        <Route
          path="/moje-wyniki"
          element={
            <RequireAuth>
              <MyResults />
            </RequireAuth>
          }
        />
        <Route
          path="/wyniki/:id"
          element={
            <RequireAuth>
              <AttemptDetails />
            </RequireAuth>
          }
        />

        <Route path="/kursy" element={<CoursesList />} />
        <Route path="/kursy/:slug" element={<CoursePage />} />
        <Route
          path="/kursy/:slug/lekcje/:id"
          element={
            <RequireAuth>
              <LessonPage />
            </RequireAuth>
          }
        />
        <Route path="/potwierdz-email" element={<VerifyEmail />} />
        <Route path="/polityka-cookies" element={<CookiePolicy />} />
        <Route path="/reset-hasla" element={<ForgotPassword />} />
        <Route path="/nowe-haslo" element={<ResetPassword />} />
        <Route path="/logowanie" element={<Login />} />
        <Route path="/rejestracja" element={<Register />} />
        <Route
          path="/konto"
          element={
            <RequireAuth>
              <Account />
            </RequireAuth>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminHome />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/quizy"
          element={
            <RequireAdmin>
              <AdminQuizList />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/kursy"
          element={
            <RequireAdmin>
              <AdminCourseList />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/kursy/:id"
          element={
            <RequireAdmin>
              <AdminCourseEdit />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/zapisy"
          element={
            <RequireAdmin>
              <AdminEnrollments />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/artykuly"
          element={
            <RequireAdmin>
              <AdminArticleList />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/artykuly/:id"
          element={
            <RequireAdmin>
              <AdminArticleEdit />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/quizy/:id"
          element={
            <RequireAdmin>
              <AdminQuizEdit />
            </RequireAdmin>
          }
        />
      </Routes>
      </Suspense>
      <CookieNotice />
    </>
  );
}

export default App;