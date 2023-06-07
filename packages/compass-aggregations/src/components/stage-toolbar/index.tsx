import React from 'react';
import { connect } from 'react-redux';
import {
  Icon,
  Body,
  css,
  cx,
  spacing,
  palette,
  useDarkMode,
  IconButton,
  GuideCueGroup,
  GuideCueStep,
} from '@mongodb-js/compass-components';
import type { RootState } from '../../modules';
import ToggleStage from './toggle-stage';
import StageCollapser from './stage-collapser';
import StageOperatorSelect from './stage-operator-select';
import { hasSyntaxError } from '../../utils/stage';
import { enableFocusMode } from '../../modules/focus-mode';
import OptionMenu from './option-menu';
import type { StoreStage } from '../../modules/pipeline-builder/stage-editor';

const toolbarStyles = css({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  borderBottomWidth: '1px',
  borderBottomStyle: 'solid',

  padding: `0 ${spacing[2]}px`,
  height: spacing[5] + spacing[1],

  flexShrink: 0,
  flexDirection: 'row',
  justifyContent: 'space-between',
  cursor: 'grab',
});

const collapsedToolbarStyles = css({
  borderBottomWidth: 0,
});

const toolbarStylesDark = css({
  borderBottomColor: palette.gray.dark2,
});

const toolbarStylesLight = css({
  borderBottomColor: palette.gray.light2,
});

const toolbarWarningStyles = css({
  borderBottomColor: palette.yellow.base,
});

const toolbarErrorStyles = css({
  borderBottomColor: palette.red.base,
});

const leftStyles = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  gap: spacing[1],
  width: '388px', // default width of the stage editor
});

const selectStyles = css({
  marginRight: spacing[2],
});

const textStyles = css({
  flex: 1,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  // align with the text on stage preview header
  paddingLeft: spacing[2],
});

const rightStyles = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: spacing[1],
});

type StageToolbarProps = {
  index: number;
  idxInPipeline: number;
  isAutoPreviewing?: boolean;
  hasSyntaxError?: boolean;
  hasServerError?: boolean;
  isCollapsed?: boolean;
  isDisabled?: boolean;
  onOpenFocusMode: (index: number) => void;
  onStageOperatorChange?: (
    index: number,
    name: string | null,
    snippet?: string
  ) => void;
};

const DISABLED_TEXT = 'Stage disabled. Results not passed in the pipeline.';
const COLLAPSED_TEXT =
  'A sample of the aggregated results from this stage will be shown below.';

export function StageToolbar({
  index,
  idxInPipeline,
  hasSyntaxError,
  hasServerError,
  isCollapsed,
  isDisabled,
  onOpenFocusMode,
  onStageOperatorChange,
}: StageToolbarProps) {
  const darkMode = useDarkMode();

  return (
    <GuideCueGroup id="Stage Toolbar" steps={5}>
      <div
        className={cx(
          'stage-editor-toolbar',
          toolbarStyles,
          darkMode ? toolbarStylesDark : toolbarStylesLight,
          hasSyntaxError && toolbarWarningStyles,
          hasServerError && toolbarErrorStyles,
          isCollapsed && collapsedToolbarStyles
        )}
      >
        <div className={leftStyles}>
          <GuideCueStep step={1} id="StageCollapse" title="Collage a stage">
            <StageCollapser index={index} />
          </GuideCueStep>
          <GuideCueStep step={2} id="StageTitle" title="Stage title">
            <Body weight="medium">Stage {idxInPipeline + 1}</Body>
          </GuideCueStep>
          <div className={selectStyles}>
            <GuideCueStep step={3} id="StageOperator" title="Stage operator">
              <StageOperatorSelect
                onChange={onStageOperatorChange}
                index={index}
              />
            </GuideCueStep>
          </div>
          <GuideCueStep step={4} id="StageToggle" title="Toggle a stage">
            <ToggleStage index={index} />
          </GuideCueStep>
        </div>
        <div className={textStyles}>
          {isDisabled ? DISABLED_TEXT : isCollapsed ? COLLAPSED_TEXT : null}
        </div>
        <div className={rightStyles}>
          <GuideCueStep step={5} id="StageFocus" title="Focus mode">
            <IconButton
              onClick={() => onOpenFocusMode(index)}
              aria-label="Open stage in focus mode"
              title="Open stage in focus mode"
              data-testid="focus-mode-button"
              data-guide-cue-ref="focus-mode-button"
            >
              <Icon glyph="FullScreenEnter" size="small"></Icon>
            </IconButton>
            <OptionMenu index={index} />
          </GuideCueStep>
        </div>
      </div>
    </GuideCueGroup>
  );
}

type StageToolbarOwnProps = Pick<StageToolbarProps, 'index'>;

export default connect(
  (state: RootState, ownProps: StageToolbarOwnProps) => {
    const {
      pipelineBuilder: {
        stageEditor: { stages },
      },
    } = state;
    const stage = stages[ownProps.index] as StoreStage;
    return {
      idxInPipeline: stage.idxInPipeline,
      isAutoPreviewing: !!state.autoPreview,
      hasSyntaxError: hasSyntaxError(stage),
      hasServerError: !!stage.serverError,
      isCollapsed: stage.collapsed,
      isDisabled: stage.disabled,
    };
  },
  {
    onOpenFocusMode: enableFocusMode,
  }
)(StageToolbar);
