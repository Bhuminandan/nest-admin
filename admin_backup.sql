--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (Ubuntu 16.9-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.9 (Ubuntu 16.9-0ubuntu0.24.04.1)

-- Started on 2025-06-16 15:04:29 IST

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP DATABASE IF EXISTS admin;
--
-- TOC entry 3476 (class 1262 OID 19767)
-- Name: admin; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE admin WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.UTF-8';


ALTER DATABASE admin OWNER TO postgres;

\connect admin

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 2 (class 3079 OID 19768)
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- TOC entry 3477 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- TOC entry 859 (class 1247 OID 19800)
-- Name: users_role_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.users_role_enum AS ENUM (
    'SUPER_ADMIN',
    'ADMIN',
    'POWER_USER',
    'USER',
    'SUPPORT_DESK'
);


ALTER TYPE public.users_role_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 216 (class 1259 OID 19779)
-- Name: groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.groups (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying NOT NULL,
    "adminId" character varying,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.groups OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 19789)
-- Name: transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transactions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    title character varying NOT NULL,
    description text,
    "filePath" character varying,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "userId" uuid
);


ALTER TABLE public.transactions OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 19811)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying NOT NULL,
    password character varying NOT NULL,
    role public.users_role_enum DEFAULT 'USER'::public.users_role_enum NOT NULL,
    "isVerified" boolean DEFAULT false NOT NULL,
    "passwordResetToken" character varying,
    "passwordResetExpires" timestamp without time zone,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "groupId" uuid
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 3468 (class 0 OID 19779)
-- Dependencies: 216
-- Data for Name: groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.groups (id, name, "adminId", "createdAt", "updatedAt") FROM stdin;
bdf3c29a-2506-49f5-846f-9cd07e07758f	Test Group	04edc231-74ac-4060-be2a-05147c996cba	2025-06-16 14:14:05.051013	2025-06-16 14:14:05.051013
\.


--
-- TOC entry 3469 (class 0 OID 19789)
-- Dependencies: 217
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transactions (id, title, description, "filePath", "createdAt", "updatedAt", "userId") FROM stdin;
1670c0b1-e154-4d76-8f9a-b07ad34517bb	Test	Testing description	uploads/1750065330665-Assignment_AdminRoles_mono.pdf	2025-06-16 14:42:38.601962	2025-06-16 14:45:30.695138	70f62cbc-53c2-4ab1-898f-e2e46a00902f
\.


--
-- TOC entry 3470 (class 0 OID 19811)
-- Dependencies: 218
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password, role, "isVerified", "passwordResetToken", "passwordResetExpires", "createdAt", "updatedAt", "groupId") FROM stdin;
41683eb5-2661-4553-bcc1-94ba04cc44ef	super@admin.com	$2b$10$2nTX41ANJQe0lU/0mkzLjOgc/ph9GU4/YEXeVTxn.u73.YCUspZhW	SUPER_ADMIN	t	\N	\N	2025-06-16 14:04:09.244407	2025-06-16 14:04:09.244407	\N
04edc231-74ac-4060-be2a-05147c996cba	admin@gmail.com	$2b$10$8SJGnC9KT8O/z9BxstyGC.pKPgLjW8IujhZPImcQlqc8e75k/A/ba	ADMIN	t	\N	\N	2025-06-16 14:13:00.047091	2025-06-16 14:13:00.047091	\N
cdfec354-a969-482d-a1f1-735874cd66fd	mbhumitwo9545@gmail.com	$2b$10$b0MrTxu5D4Zakd2rQQSCYOOErSsbzeI8GBEDR3mpETs6P/PYvYQ8C	POWER_USER	t	\N	\N	2025-06-16 14:17:55.355381	2025-06-16 14:20:57.890639	\N
70f62cbc-53c2-4ab1-898f-e2e46a00902f	mbhumione9545@gmail.com	$2b$10$3hYzsTnyc/DVTtxd/A1uDeEX1UbmJ0XMvOcVuAw2qQboNe11r3pBG	USER	t	\N	\N	2025-06-16 14:17:16.738124	2025-06-16 14:23:30.30968	\N
f0a4144c-177c-4c27-ada4-37ee48b537a1	support@gmail.com	$2b$10$IOWahwbSuun/e9i6.weFLO/9nKxHevoW1K5P7c4wKbY1OJdxw0OU6	SUPPORT_DESK	t	\N	\N	2025-06-16 14:33:03.697592	2025-06-16 14:33:03.697592	\N
\.


--
-- TOC entry 3316 (class 2606 OID 19788)
-- Name: groups PK_659d1483316afb28afd3a90646e; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT "PK_659d1483316afb28afd3a90646e" PRIMARY KEY (id);


--
-- TOC entry 3318 (class 2606 OID 19798)
-- Name: transactions PK_a219afd8dd77ed80f5a862f1db9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY (id);


--
-- TOC entry 3320 (class 2606 OID 19822)
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
-- TOC entry 3322 (class 2606 OID 19824)
-- Name: users UQ_97672ac88f789774dd47f7c8be3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE (email);


--
-- TOC entry 3323 (class 2606 OID 19825)
-- Name: transactions FK_6bb58f2b6e30cb51a6504599f41; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT "FK_6bb58f2b6e30cb51a6504599f41" FOREIGN KEY ("userId") REFERENCES public.users(id);


--
-- TOC entry 3324 (class 2606 OID 19830)
-- Name: users FK_b1d770f014b76f7cfb58089dafc; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "FK_b1d770f014b76f7cfb58089dafc" FOREIGN KEY ("groupId") REFERENCES public.groups(id);


-- Completed on 2025-06-16 15:04:30 IST

--
-- PostgreSQL database dump complete
--

