import {
  creatChecker,
  creatStringChecker,
  DoChecker,
} from '../checker/do-checker';
import { DoCheckerType } from '../type/do-checker-type';
import { Dependency } from '../type/dependency';
import { AllPossibleCheckers, CheckerFunction } from '../type/checker-function';
import {
  DefaultOptions,
  DoRuleOptions,
  DoSuppressErrors,
} from '../type/do-rule-options';

export function doAnd(
  checkers: AllPossibleCheckers[],
  options: DoRuleOptions = DefaultOptions,
  name = 'logical and'
): DoCheckerType[] {
  if (!checkers || checkers?.length === 0) {
    return [];
  }
  return [
    creatChecker(name, (args: any[], dependency: Dependency) => {
      return anyCheckerToDoChecker(checkers).every(
        safeRunCheck(args, dependency, options, true)
      );
    }),
  ];
}

export function doOr(
  checkers: AllPossibleCheckers[],
  options: DoRuleOptions = DefaultOptions,
  name = 'logical or'
): DoCheckerType[] {
  if (!checkers || checkers?.length === 0) {
    return [];
  }
  return [
    creatChecker(name, (args: any[], dependency: Dependency) => {
      return anyCheckerToDoChecker(checkers).some(
        safeRunCheck(args, dependency, options, false)
      );
    }),
  ];
}

export function doNot(
  checker: AllPossibleCheckers,
  options: DoRuleOptions = DefaultOptions,
  name = 'logical not'
): DoCheckerType[] {
  if (!checker) {
    return [];
  }
  return [
    creatChecker(name, (args: any[], dependency: Dependency) => {
      return !safeRunCheck(
        args,
        dependency,
        options,
        false
      )(anyCheckerToDoChecker([checker])[0]);
    }),
  ];
}

function anyCheckerToDoChecker(checkers: AllPossibleCheckers[]): DoChecker[] {
  return checkers
    .filter((chk) => !!chk)
    .map((checker) =>
      checker instanceof DoChecker
        ? checker
        : typeof checker === 'string'
          ? creatStringChecker(checker)
          : creatChecker(name, checker as CheckerFunction)
    );
}

function safeRunCheck(
  args: any[],
  dependency: Dependency,
  options: DoRuleOptions,
  returnDefault: boolean
) {
  return (checker: DoChecker) => {
    try {
      return checker.check(args, dependency);
    } catch (e) {
      if (options.suppressErrors === DoSuppressErrors.allErrors) {
        throw e;
      } else if (options.suppressErrors === DoSuppressErrors.warnings) {
        console.error(e.message);
      }

      return returnDefault;
    }
  };
}
