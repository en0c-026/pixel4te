/* eslint-disable jsx-a11y/anchor-is-valid */
import { Button } from "flowbite-react";
import Head from "next/head";
import Link from "next/link";
import FeatureCard from "../components/Home/feature-card";
import { textContent } from "../constants";

const Home = () => {
  return (
    <>
      <Head>
        <title>{textContent.homepage.title}</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="h-fit w-full bg-slate-100 dark:bg-slate-900">
        <div className="flex h-72 flex-col items-center justify-center space-y-3 border-b border-slate-400 dark:border-slate-800 sm:h-96">
          <h1 className="text-2xl font-bold dark:text-white sm:text-3xl ">
            {textContent.homepage.valuePropose.title}
          </h1>
          <p className="text-center text-xs text-slate-800 dark:text-slate-300 sm:text-sm ">
            {textContent.homepage.valuePropose.subtitle}
          </p>
          <div className="pt-6 sm:pt-8">
            <Link href="/editor">
              <a>
                <Button gradientDuoTone="purpleToPink" size="lg">
                  {textContent.homepage.callToAcction.button}
                </Button>
              </a>
            </Link>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center space-y-4 border-b border-slate-400 py-8 dark:border-slate-800 sm:flex-row sm:justify-evenly sm:space-y-0">
          <FeatureCard
            title={textContent.homepage.valuePropose.features.editorCard.title}
            items={textContent.homepage.valuePropose.features.editorCard.items}
          />
          <FeatureCard
            title={textContent.homepage.valuePropose.features.nftCard.title}
            items={textContent.homepage.valuePropose.features.nftCard.items}
          />
        </div>
      </main>
    </>
  );
};

export default Home;