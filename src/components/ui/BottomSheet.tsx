import { Drawer } from 'vaul';

import React from 'react';

interface BottomSheetProps {
  trigger: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function BottomSheet({ trigger, title, description, children }: BottomSheetProps) {
  return (
    <Drawer.Root shouldScaleBackground>
      <Drawer.Trigger asChild>
        {trigger}
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity" />
        
        <Drawer.Content className="bg-white flex flex-col rounded-t-[2rem] mt-24 h-fit max-h-[96vh] fixed bottom-0 left-0 right-0 z-50 shadow-2xl focus:outline-none">
          <div className="p-4 bg-white rounded-t-[2rem] flex-1">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-slate-300 mb-6" />
            
            <div className="max-w-md mx-auto">
              <Drawer.Title className="font-semibold text-2xl text-slate-900 mb-2">
                {title}
              </Drawer.Title>
              
              <Drawer.Description className={description ? "text-slate-500 mb-6 font-medium" : "sr-only"}>
                {description || title}
              </Drawer.Description>
              
              <div className="pb-8">
                {children}
              </div>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
