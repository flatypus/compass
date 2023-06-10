import type { Action, AnyAction, Reducer } from 'redux';
import { combineReducers } from 'redux';
import type { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { createLoggerAndTelemetry } from '@mongodb-js/compass-logging';
import mongodbns from 'mongodb-ns';
import type AppRegistry from 'hadron-app-registry';

import { isAction } from '../utils/is-action';
import {
  FavoriteQueriesActionTypes,
  favoriteQueriesReducer,
} from './favorite-queries';
import type {
  RunFavoriteQueryAction,
  SaveFavoriteQueryAction,
} from './favorite-queries';
import {
  RecentQueriesActionTypes,
  recentQueriesReducer,
} from './recent-queries';
import type { RunRecentQueryAction } from './recent-queries';

const { track } = createLoggerAndTelemetry('COMPASS-QUERY-HISTORY-UI');

export const enum QueryHistoryActionTypes {
  ShowFavorites = 'compass-query-history/ShowFavorites',
  ShowRecent = 'compass-query-history/ShowRecent',
}

type ShowFavoritesAction = {
  type: QueryHistoryActionTypes.ShowFavorites;
};

export function showFavorites(): ShowFavoritesAction {
  return {
    type: QueryHistoryActionTypes.ShowFavorites,
  };
}

type ShowRecentAction = {
  type: QueryHistoryActionTypes.ShowRecent;
};

export function showRecent(): ShowRecentAction {
  return {
    type: QueryHistoryActionTypes.ShowRecent,
  };
}

export type QueryHistoryState = {
  showing: 'recent' | 'favorites';
  ns: ReturnType<typeof mongodbns>;
  localAppRegistry: AppRegistry | undefined;
  currentHost?: string;
};

const getInitialState = (): QueryHistoryState => ({
  showing: 'recent',
  ns: mongodbns(''),
  currentHost: undefined,
  localAppRegistry: undefined,
});

const queryHistoryReducer: Reducer<QueryHistoryState> = (
  state = getInitialState(),
  action
) => {
  if (
    isAction<ShowFavoritesAction>(action, QueryHistoryActionTypes.ShowFavorites)
  ) {
    track('Query History Favorites');

    return {
      ...state,
      showing: 'favorites',
    };
  }

  if (
    isAction<SaveFavoriteQueryAction>(
      action,
      FavoriteQueriesActionTypes.SaveFavoriteQuery
    )
  ) {
    // When a favorite is saved we show the favorites list.
    return {
      ...state,
      showing: 'favorites',
    };
  }

  if (isAction<ShowRecentAction>(action, QueryHistoryActionTypes.ShowRecent)) {
    track('Query History Recent');

    return {
      ...state,
      showing: 'recent',
    };
  }

  if (
    isAction<RunFavoriteQueryAction>(
      action,
      FavoriteQueriesActionTypes.RunFavoriteQuery
    ) ||
    isAction<RunRecentQueryAction>(
      action,
      RecentQueriesActionTypes.RunRecentQuery
    )
  ) {
    state.localAppRegistry?.emit(
      'query-history-run-query',
      action.queryAttributes
    );

    return {
      ...state,
    };
  }

  return state;
};

const rootReducer = combineReducers({
  queryHistory: queryHistoryReducer,
  favoriteQueries: favoriteQueriesReducer,
  recentQueries: recentQueriesReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export type QueryHistoryThunkDispatch<A extends Action = AnyAction> =
  ThunkDispatch<RootState, void, A>;

export type QueryHistoryThunkAction<
  R,
  A extends Action = AnyAction
> = ThunkAction<R, RootState, void, A>;

export { rootReducer };
