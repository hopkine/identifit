import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';

export default function NavTabLayout() {
  return (
    <NativeTabs
      minimizeBehavior="onScrollDown"
      tintColor="#C0D1FF"
      iconColor={{
        default: '#6B7280',
        selected: '#C0D1FF',
      }}
      disableTransparentOnScrollEdge>
      <NativeTabs.Trigger name="saved">
        <Label hidden />
        <Icon sf={{ default: 'bookmark', selected: 'bookmark.fill' }} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="closet">
        <Label hidden />
        <Icon sf={{ default: 'star', selected: 'star.fill' }} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="home">
        <Label hidden />
        <Icon sf={{ default: 'house', selected: 'house.fill' }} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="explore">
        <Label hidden />
        <Icon sf={{ default: 'safari', selected: 'safari.fill' }} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Label hidden />
        <Icon sf={{ default: 'person', selected: 'person.fill' }} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
