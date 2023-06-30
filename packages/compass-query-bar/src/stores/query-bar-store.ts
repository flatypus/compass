import type AppRegistry from 'hadron-app-registry';
import {
  createStore as _createStore,
  applyMiddleware,
  combineReducers,
} from 'redux';
import thunk from 'redux-thunk';
import type { AnyAction } from 'redux';
import type { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { DEFAULT_FIELD_VALUES } from '../constants/query-bar-store';
import type { BaseQuery } from '../constants/query-properties';
import { mapFormFieldsToQuery, mapQueryToFormFields } from '../utils/query';
import type { ChangeFilterEvent } from '../modules/change-filter';
import {
  queryBarReducer,
  INITIAL_STATE as INITIAL_QUERY_BAR_STATE,
  changeSchemaFields,
  applyFilterChange,
} from './query-bar-reducer';
import { aiQueryReducer } from './ai-query-reducer';
import {
  FavoriteQueryStorage,
  RecentQueryStorage,
  getQueryAttributes,
} from '../utils';
import { getStoragePaths } from '@mongodb-js/compass-utils';
import { AtlasSignIn } from '@mongodb-js/atlas-signin/renderer';
import atlasSignInReducer from './atlas-signin-reducer';

const { basepath } = getStoragePaths() || {};

export type QueryBarStoreOptions = {
  serverVersion: string;
  globalAppRegistry: AppRegistry;
  localAppRegistry: AppRegistry;
  query: BaseQuery;
  namespace: string;
  dataProvider: {
    dataProvider?: {
      getConnectionString: () => {
        hosts: string[];
      };
    };
  };

  // For testing.
  basepath?: string;
};

export const rootQueryBarReducer = combineReducers({
  queryBar: queryBarReducer,
  aiQuery: aiQueryReducer,
  atlasSignIn: atlasSignInReducer,
});

export type RootState = ReturnType<typeof rootQueryBarReducer>;

export type QueryBarExtraArgs = {
  globalAppRegistry?: AppRegistry;
  localAppRegistry?: AppRegistry;
  favoriteQueryStorage: FavoriteQueryStorage;
  recentQueryStorage: RecentQueryStorage;
  atlasSignIn: typeof AtlasSignIn;
};

export type QueryBarThunkDispatch<A extends AnyAction = AnyAction> =
  ThunkDispatch<RootState, QueryBarExtraArgs, A>;

export type QueryBarThunkAction<
  R,
  A extends AnyAction = AnyAction
> = ThunkAction<R, RootState, QueryBarExtraArgs, A>;

function createStore(options: Partial<QueryBarStoreOptions> = {}) {
  const {
    serverVersion,
    localAppRegistry,
    globalAppRegistry,
    query,
    namespace,
    dataProvider,
  } = options;

  const recentQueryStorage = new RecentQueryStorage(
    options.basepath ?? basepath,
    namespace
  );
  const favoriteQueryStorage = new FavoriteQueryStorage(
    options.basepath ?? basepath,
    namespace
  );

  return _createStore(
    rootQueryBarReducer,
    {
      queryBar: {
        ...INITIAL_QUERY_BAR_STATE,
        namespace: namespace ?? '',
        host: dataProvider?.dataProvider?.getConnectionString().hosts.join(','),
        serverVersion: serverVersion ?? '3.6.0',
        fields: mapQueryToFormFields({
          ...DEFAULT_FIELD_VALUES,
          ...getQueryAttributes(query ?? {}),
        }),
      },
    },
    applyMiddleware(
      thunk.withExtraArgument({
        localAppRegistry,
        globalAppRegistry,
        recentQueryStorage,
        favoriteQueryStorage,
        atlasSignIn: AtlasSignIn,
      })
    )
  );
}

export function configureStore(options: Partial<QueryBarStoreOptions> = {}) {
  const { localAppRegistry } = options;

  const store = createStore(options);

  localAppRegistry?.on('fields-changed', (fields) => {
    store.dispatch(changeSchemaFields(fields.autocompleteFields));
  });

  localAppRegistry?.on('query-bar-change-filter', (evt: ChangeFilterEvent) => {
    store.dispatch(applyFilterChange(evt));
  });

  (store as any).getCurrentQuery = () => {
    return mapFormFieldsToQuery(store.getState().queryBar.fields);
  };

  return store as ReturnType<typeof createStore> & {
    getCurrentQuery(): unknown;
  };
}

export default configureStore;
