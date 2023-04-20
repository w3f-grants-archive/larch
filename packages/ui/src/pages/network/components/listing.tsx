import { useEffect, useState } from 'react';
import NetworkListTable from './table';
import PaginatedItems from '../../../components/pagination';
import { deleteNetwork, getNetworkList, testNetwork } from '../../../utils/api';
import { notify } from '../../../utils/notifications';
import Filter from '../../../components/filter';
import { useNetworkFilterStore } from '../../../store/networkStore';
import { useFilterSubmit } from '../../../store/commonStore';
import DeletePopUpBox from './modaldelete';
import TestPopUpBox from './modaltest';

export default function Listing() {
  const [networkList, setNetworkList] = useState<any[]>([]);
  const [meta, setMeta] = useState<{ total: number }>({ total: 0 });
  const [itemPerPage] = useState(5);
  const [pageNum, setPageNum] = useState(1);
  const [pageToggle, setPageToggle] = useState(true);
  const [sort, setSort] = useState<boolean>(true);
  const [deleteNetworkName, setDeleteNetwork] = useState('');
  const [testNetworkName, setTestNetwork] = useState('');

  const defaultModalView = {
    test: false,
    delete: false,

  };
  const [isOpen, setIsOpen] = useState(defaultModalView);

  const setModalViewStatus = (modalSlug: string, status: boolean) => {
    setIsOpen({ ...defaultModalView, [modalSlug]: status });
  };
  const networkFilterData = useNetworkFilterStore(
    (state) => state.networkFilterData,
  );
  const setNetworkFilterData = useNetworkFilterStore(
    (state) => state.setNetworkFilterData,
  );

  const isFilterSubmit = useFilterSubmit((state) => state.isFilterSubmit);
  const setIsFilterSubmit = useFilterSubmit((state) => state.setIsFilterSubmit);

  const onPageChange = (pageNumOnChange: number) => {
    setPageNum(pageNumOnChange);
  };

  const onCreateModal = (name: string) => {
    setDeleteNetwork(name);
    setModalViewStatus('delete', true);
  };

  const onCreateTestModal = (name: string) => {
    setTestNetwork(name);
    setModalViewStatus('test', true);
  };

  const onNetworkDelete = (networkName: string) => {
    deleteNetwork(networkName)
      .then(() => {
        setModalViewStatus('delete', false);
        notify('success', `Deleted the network ("${networkName}")`);
        setPageToggle(!pageToggle);
      })
      .catch(() => {
        notify('error', `Failed delete the network ("${networkName}")`);
      });
  };

  const onNetworkTest = (name: string) => {
    testNetwork(name)
      .then(() => {
        setModalViewStatus('test', false);
        notify('success', 'network successfully tested');
      }).catch(() => {
        notify('error', 'Failed to test network');
      });
  };

  useEffect(() => {
    getNetworkList({
      meta: {
        numOfRec: itemPerPage,
        pageNum,
      },
    })
      .then((response) => {
        setNetworkList(response.result);
        setMeta(response.meta);
      })
      .catch(() => {
        notify('error', 'Failed to fetch network list');
      });
  }, [pageNum, pageToggle]);

  const filterData = () => {
    const filter: { [name: string]: string } = {};
    networkFilterData.forEach((item) => {
      if (item.inputValue) filter[item.key] = item.inputValue;
    });
    const payload = {
      filter,
      sort: [
        {
          field: 'createdAt',
          direction: sort ? 'asc' : 'desc',
        },
      ],
      meta: {
        pageNum,
        numOfRec: itemPerPage,
      },
    };
    getNetworkList(payload)
      .then((response) => {
        setNetworkList(response.result);
        setMeta(response.meta);
      })
      .catch(() => {
        notify('error', 'Failed to fetch activity list');
      });
  };

  useEffect(() => {
    filterData();
  }, [pageNum, isFilterSubmit, sort]);

  return (
    <>
      <div className='flex w-full justify-end gap-4'>
        <Filter
          filterData={networkFilterData}
          isFilterSubmit={isFilterSubmit}
          setFilterData={setNetworkFilterData}
          setIsFilterSubmit={setIsFilterSubmit}
        />
      </div>
      <div className='flex flex-col justify-between'>
        <NetworkListTable
          networkList={networkList}
          setSort={setSort}
          sort={sort}
          onCreateModal={onCreateModal}
          onCreateTestModal={onCreateTestModal}
        />
        <DeletePopUpBox
          isOpen={isOpen.delete}
          setIsOpen={(status) => { setModalViewStatus('delete', status); }}
          onConfirm={onNetworkDelete}
          name={deleteNetworkName}
        />
        <TestPopUpBox
          isOpen={isOpen.test}
          setIsOpen={(status) => { setModalViewStatus('test', status); }}
          onConfirmTest={onNetworkTest}
          name={testNetworkName}
        />
        <div className='right-2 bottom-0 flex flex-row justify-end'>
          <PaginatedItems
            itemsPerPage={itemPerPage}
            totalRecords={meta.total}
            onPageChange={onPageChange}
          />
        </div>
      </div>
    </>
  );
}
