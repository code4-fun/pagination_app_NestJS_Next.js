import Head from "next/head";
import {Inter} from "next/font/google";
import Table from "react-bootstrap/Table";
import {Alert, Container, Pagination} from "react-bootstrap";
import {GetServerSideProps, GetServerSidePropsContext} from "next";
import { useState } from "react";

const inter = Inter({subsets: ["latin"]});

type TUserItem = {
  id: number
  firstname: string
  lastname: string
  email: string
  phone: string
  updatedAt: string
}

type TGetServerSideProps = {
  statusCode: number
  users: TUserItem[]
}


export const getServerSideProps = (async (ctx: GetServerSidePropsContext): Promise<{ props: TGetServerSideProps }> => {
  try {
    const res = await fetch("http://localhost:3000/users", {method: 'GET'})
    if (!res.ok) {
      return {props: {statusCode: res.status, users: []}}
    }

    return {
      props: {statusCode: 200, users: await res.json()}
    }
  } catch (e) {
    return {props: {statusCode: 500, users: []}}
  }
}) satisfies GetServerSideProps<TGetServerSideProps>


export default function Home({statusCode, users}: TGetServerSideProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const totalPages = Math.ceil(users.length / itemsPerPage);
  const maxPageButtons = 10;
  const halfMaxButtons = Math.floor(maxPageButtons / 2);

  const paginationStart =
    currentPage <= halfMaxButtons
      ? 1
      : currentPage > totalPages - halfMaxButtons
        ? Math.max(totalPages - maxPageButtons + 1, 1)
        : currentPage - halfMaxButtons + 1

  const paginationEnd =
    currentPage <= halfMaxButtons
      ? Math.min(totalPages, maxPageButtons)
      : currentPage > totalPages - halfMaxButtons
        ? totalPages
        : currentPage + halfMaxButtons;

  const currentUsers = users.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleFirstPage = () => {
    setCurrentPage(1);
  };

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const handleLastPage = () => {
    setCurrentPage(totalPages);
  };

  if (statusCode !== 200) {
    return <Alert variant={'danger'}>Ошибка {statusCode} при загрузке данных</Alert>
  }

  return (
    <>
      <Head>
        <title>Тестовое задание</title>
        <meta name="description" content="Тестовое задание"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <link rel="icon" href="/favicon.ico"/>
      </Head>

      <main className={inter.className}>
        <Container>
          <h1 className={'mb-5'}>Пользователи</h1>

          <Table striped bordered hover>
            <thead>
            <tr>
              <th>ID</th>
              <th>Имя</th>
              <th>Фамилия</th>
              <th>Телефон</th>
              <th>Email</th>
              <th>Дата обновления</th>
            </tr>
            </thead>
            <tbody>
            {currentUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.firstname}</td>
                <td>{user.lastname}</td>
                <td>{user.phone}</td>
                <td>{user.email}</td>
                <td>{user.updatedAt}</td>
              </tr>
            ))}
            </tbody>
          </Table>

          <Pagination size="sm" className="mt-3">
            <Pagination.First onClick={handleFirstPage} />
            <Pagination.Prev onClick={handlePreviousPage} />
            {Array.from(
              { length: paginationEnd - paginationStart + 1 },
              (_, index) => (
                <Pagination.Item
                  key={paginationStart + index}
                  active={paginationStart + index === currentPage}
                  onClick={() => handlePageChange(paginationStart + index)}
                >
                  {paginationStart + index}
                </Pagination.Item>
              )
            )}
            <Pagination.Next onClick={handleNextPage} />
            <Pagination.Last onClick={handleLastPage} />
          </Pagination>

        </Container>
      </main>
    </>
  );
}
