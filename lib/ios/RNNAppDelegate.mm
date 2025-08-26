
#import "RNNAppDelegate.h"
#import <React/RCTHermesInstanceFactory.h>
#import <ReactNativeNavigation/ReactNativeNavigation.h>
#import <react/featureflags/ReactNativeFeatureFlags.h>
#import <react/featureflags/ReactNativeFeatureFlagsDefaults.h>
// react/config/ReactNativeConfig.h removed in React Native 0.80 - was unused

#import "RCTAppSetupUtils.h"
#import <React/CoreModulesPlugins.h>
#import <React/RCTBridge+Private.h>
#import <React/RCTBridgeProxy.h>
#import <React/RCTCxxBridgeDelegate.h>
#import <React/RCTImageLoader.h>
#import <React/RCTLegacyViewManagerInteropComponentView.h>
#import <React/RCTSurfacePresenter.h>
#import <React/RCTSurfacePresenterBridgeAdapter.h>
#import <React/RCTSurfacePresenterStub.h>
#import <ReactCommon/RCTTurboModuleManager.h>
#import <react/nativemodule/defaults/DefaultTurboModules.h>
#import <react/renderer/runtimescheduler/RuntimeScheduler.h>
#import <react/renderer/runtimescheduler/RuntimeSchedulerCallInvoker.h>
#import <react/utils/ManagedObjectWrapper.h>

#import <React/RCTComponentViewFactory.h>

static NSString *const kRNConcurrentRoot = @"concurrentRoot";

@interface RNNAppDelegate () <RCTTurboModuleManagerDelegate,
                              RCTComponentViewFactoryComponentProvider> {
}
@end

@implementation RNNAppDelegate

- (BOOL)application:(UIApplication *)application
    didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {

    // RNNAppDelegate handles React Native setup directly (doesn't call super)
    // This matches the original React Native Navigation pattern
    [self _setUpFeatureFlags];

    // Copied from RCTAppDelegate, it private inside it
    RCTRootViewFactory *rootViewFactory = [self createRCTRootViewFactory];

    [RCTComponentViewFactory currentComponentViewFactory].thirdPartyFabricComponentsProvider = self;

    // React Native 0.80 Migration Strategy: Prepare for RCTSetNewArchEnabled removal in 0.81+
    BOOL newArchEnabled = [self isNewArchEnabledFromInfoPlist];

    RCTAppSetupPrepareApp(application, newArchEnabled);

    // COMPATIBILITY: Keep RCTSetNewArchEnabled for React Native 0.80 support
    // TODO React Native 0.81: Remove this call and rely solely on Info.plist configuration
    RCTSetNewArchEnabled(newArchEnabled);
    RCTEnableTurboModuleInterop(YES);
    RCTEnableTurboModuleInteropBridgeProxy(YES);

    rootViewFactory.reactHost = [rootViewFactory createReactHost:launchOptions];

    [ReactNativeNavigation bootstrapWithHost:rootViewFactory.reactHost];

    return YES;
}

- (RCTRootViewFactory *)createRCTRootViewFactory {
    __weak __typeof(self) weakSelf = self;
    RCTBundleURLBlock bundleUrlBlock = ^{
      RCTAppDelegate *strongSelf = weakSelf;
      return strongSelf.bundleURL;
    };

    RCTRootViewFactoryConfiguration *configuration = [[RCTRootViewFactoryConfiguration alloc]
        initWithBundleURLBlock:bundleUrlBlock
                newArchEnabled:[self isNewArchEnabledFromInfoPlist]];

    // CRITICAL: Set RNNAppDelegate as the JS Runtime Configurator for React Native 0.80
    configuration.jsRuntimeConfiguratorDelegate = self;

    return [[RCTRootViewFactory alloc] initWithConfiguration:configuration
                               andTurboModuleManagerDelegate:self];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge {
    [NSException raise:@"RCTBridgeDelegate::sourceURLForBridge not implemented"
                format:@"Subclasses must implement a valid sourceURLForBridge method"];
    return nil;
}

- (BOOL)concurrentRootEnabled {
    return true;
}

#pragma mark - React Native 0.81+ Migration Helper

- (BOOL)isNewArchEnabledFromInfoPlist {
    // React Native 0.81+ Migration: Read New Architecture setting from Info.plist
    // This replaces the deprecated RCTSetNewArchEnabled() call
    // Reference:
    // https://github.com/facebook/react-native/blob/main/packages/react-native/React/Base/RCTUtils.h#L190-L192
    NSBundle *bundle = [NSBundle mainBundle];
    NSNumber *newArchEnabled = [bundle objectForInfoDictionaryKey:@"RCTNewArchEnabled"];

    if (newArchEnabled != nil) {
        return [newArchEnabled boolValue];
    }

    // Fallback to RCTIsNewArchEnabled() for backward compatibility with existing configurations
    return RCTIsNewArchEnabled();
}

#pragma mark - RCTTurboModuleManagerDelegate

- (Class)getModuleClassFromName:(const char *)name {
    return RCTCoreModulesClassProvider(name);
}

- (std::shared_ptr<facebook::react::TurboModule>)
    getTurboModule:(const std::string &)name
         jsInvoker:(std::shared_ptr<facebook::react::CallInvoker>)jsInvoker {
    return facebook::react::DefaultTurboModules::getTurboModule(name, jsInvoker);
}

- (std::shared_ptr<facebook::react::TurboModule>)
    getTurboModule:(const std::string &)name
        initParams:(const facebook::react::ObjCTurboModule::InitParams &)params {
    return nullptr;
}

- (id<RCTTurboModule>)getModuleInstanceFromClass:(Class)moduleClass {
    return RCTAppSetupDefaultModuleFromClass(moduleClass, self.dependencyProvider);
}

#pragma mark - Feature Flags

class RCTAppDelegateBridgelessFeatureFlags
    : public facebook::react::ReactNativeFeatureFlagsDefaults {
  public:
    bool enableBridgelessArchitecture() override { return true; }
    bool enableFabricRenderer() override { return true; }
    bool useTurboModules() override { return true; }
    bool useNativeViewConfigsInBridgelessMode() override { return true; }
};

- (void)_setUpFeatureFlags {
    // Use Info.plist-based New Architecture detection for React Native 0.81+ compatibility
    if ([self isNewArchEnabledFromInfoPlist]) {
        facebook::react::ReactNativeFeatureFlags::override(
            std::make_unique<RCTAppDelegateBridgelessFeatureFlags>());
    }
}

#pragma mark - RCTJSRuntimeConfiguratorProtocol

- (JSRuntimeFactoryRef)createJSRuntimeFactory {
    // React Native 0.80 requires valid Hermes runtime factory - matches
    // RCTDefaultReactNativeFactoryDelegate
#if USE_THIRD_PARTY_JSC != 1
    return jsrt_create_hermes_factory();
#else
    return nullptr;
#endif
}

@end
