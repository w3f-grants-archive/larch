/* eslint-disable linebreak-style */
/* eslint-disable react/button-has-type */
/* eslint-disable max-len */
import { Dialog } from '@headlessui/react';
import { TemplateDelete } from '../types';

type DeletePopUpBoxProps = {
  setIsOpen: (obj: TemplateDelete) => void;
  onConfirm: (name: string) => void;
  deleteTemplateObj: TemplateDelete;
};

export default function DeletePopUpBox({
  setIsOpen,
  onConfirm,
  deleteTemplateObj,
}: DeletePopUpBoxProps) {
  return (
    <Dialog
      open={deleteTemplateObj.isOpen}
      onClose={() => setIsOpen({ ...deleteTemplateObj, isOpen: false })}
      className='relative z-50'
    >
      <div className='fixed inset-0 bg-black/80' aria-hidden='true' />
      <div className='fixed inset-0 flex items-center justify-center '>
        <Dialog.Panel className='w-full max-w-lg rounded bg-create-button border-border border-4 p-6'>
          <Dialog.Description />
          <div className='flex flex-col gap-y-6'>
            <div className='flex flex-row'>
              <div className='text-white font-rubik text-base flex-1 text-center'>
                Do you want to delete '
                {deleteTemplateObj.templateName}
                '
              </div>
            </div>
            <div className='flex flex-row justify-between'>
              <button
                className='border-2 border-border rounded-lg py-1.5 px-2 bg-green hover:bg-dark-green text-white font-bold'
                onClick={() => onConfirm(deleteTemplateObj.templateId)}
              >
                Confirm
              </button>
              <button
                className='border-2 border-border rounded-lg py-1.5 px-2 bg-red-500 hover:bg-violet-700  text-white font-bold '
                onClick={() => setIsOpen({ ...deleteTemplateObj, isOpen: false })}
              >
                Cancel
              </button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}