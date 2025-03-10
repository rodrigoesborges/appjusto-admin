import { Banner, BannersOrdering, ClientFlavor, WithId } from '@appjusto/types';
import { useContextApi } from 'app/state/api/context';
import { getBannersByFlavorOrdered } from 'pages/backoffice/banners/utils';
import React from 'react';

export const useObserveBannersByFlavor = (
  flavor: ClientFlavor,
  getImages?: boolean,
  onlyEnabled?: boolean
) => {
  // context
  const api = useContextApi();
  // state
  const [banners, setBanners] = React.useState<WithId<Banner>[] | null>();
  const [ordering, setOrdering] = React.useState<BannersOrdering | null>();
  // side effects
  React.useEffect(() => {
    api.banners().observeBannersOrdering(setOrdering);
  }, [api]);
  React.useEffect(() => {
    if (!ordering) return;
    api.banners().observeBannersByFlavor(
      flavor,
      async (data) => {
        if (data) {
          const ordered = getBannersByFlavorOrdered(ordering[flavor], data);
          if (getImages) {
            const orderedWithImages = await Promise.all(
              ordered.map(async (item) => {
                const images = [];
                const mobile = await api
                  .banners()
                  .getBannerImageURL(
                    flavor,
                    item.id,
                    '_320x100',
                    item.mobileImageType
                  );
                const web = await api
                  .banners()
                  .getBannerImageURL(
                    flavor,
                    item.id,
                    '_980x180',
                    item.webImageType
                  );
                images.push(mobile);
                images.push(web);
                return { ...item, images };
              })
            );
            setBanners(orderedWithImages);
          } else {
            setBanners(ordered);
          }
        } else setBanners(data);
      },
      onlyEnabled
    );
  }, [api, ordering, flavor, getImages, onlyEnabled]);
  // result
  return banners;
};
