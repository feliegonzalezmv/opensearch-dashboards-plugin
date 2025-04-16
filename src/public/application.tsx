import React from "react";
import ReactDOM from "react-dom";
import { AppMountParameters, CoreStart } from "../../../src/core/public";
import { AppPluginStartDependencies } from "./types";
import TodoApp from "./components/todo/TodoApp";
import { EuiPage, EuiPageBody, EuiPageHeader, EuiTitle } from "@elastic/eui";
import "@elastic/eui/dist/eui_theme_light.css";

interface CustomPluginAppDeps {
  basename: string;
  notifications: CoreStart["notifications"];
  http: CoreStart["http"];
}

export const renderApp = (
  { basename, notifications, http }: CustomPluginAppDeps,
  { navigation }: AppPluginStartDependencies,
  { appBasePath, element }: AppMountParameters
) => {
  ReactDOM.render(
    <EuiPage>
      <EuiPageBody>
        <EuiPageHeader>
          <EuiTitle size="l">
            <h1>Task Manager</h1>
          </EuiTitle>
        </EuiPageHeader>
        <TodoApp />
      </EuiPageBody>
    </EuiPage>,
    element
  );

  return () => ReactDOM.unmountComponentAtNode(element);
};
