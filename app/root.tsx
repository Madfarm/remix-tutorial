import { json, redirect } from "@remix-run/node";
import type {
  LinksFunction,
  LoaderFunctionArgs
} from "@remix-run/node"
import appStylesHref from "./app.css?url"
import { getContacts, createEmptyContact } from './data'
import { useEffect } from 'react'

import {
  Form,
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigation,
  useSubmit
} from "@remix-run/react";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: appStylesHref }
];

export const loader = async ({
  request,
}: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const query = url.searchParams.get("query");
  const contacts = await getContacts(query);
  return json({ contacts, query });
}

export const action = async () => {
  const contact = await createEmptyContact();
  return redirect(`/contacts/${contact.id}/edit`);
}

export default function App() {
  const { contacts, query } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const submit = useSubmit();
  const isSearching: boolean | undefined = 
    navigation.location &&
    new URLSearchParams(navigation.location.search).has("query");

  useEffect(() => {
    const searchField = document.getElementById("query");
    if (searchField instanceof HTMLInputElement) {
      searchField.value = query || "";
    }
  }, [query])

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div id="sidebar">
          <h1>Remix Contacts</h1>
          <div>
            <Form
              onChange={(e) => {
                const isFirstSearch = query === null;
                submit(e.currentTarget, {
                  replace: !isFirstSearch,
                });
              }}
              id="search-form"
              role="search">
              <input
                id="query"
                aria-label="Search contacts"
                className={isSearching ? "loading": ""}
                defaultValue={query || ""}
                placeholder="Search"
                type="search"
                name="query"
              />
              <div id="search-spinner" aria-hidden hidden={!isSearching} />
            </Form>
            <Form method="post">
              <button type="submit">New</button>
            </Form>
          </div>
  
          <nav>
            {contacts.length ? (
                <ul>
                  {contacts.map((contact) => (
                    <li key={contact.id}>
                      <NavLink
                        className={({ isActive, isPending}) => 
                          isActive 
                            ? "active"
                            : isPending
                            ? "pending"
                            : ""
                        } 
                        to={`contacts/${contact.id}`}
                      >
                        {contact.first || contact.last ? (
                          <>
                            {contact.first} {contact.last}
                          </>
                        ) : (
                          <i>No Name</i>
                        )}{" "}
                        {contact.favorite ? (
                          <span>★</span>
                        ) : null}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>
                  <i>No contacts</i>
                </p>
              )}
          </nav>
        </div>

        <div
          className={navigation.state === "loading" && isSearching ? "loading" : ""}
          id="detail"
        >
            <Outlet />
        </div>

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
