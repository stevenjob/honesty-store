// import { reduce } from "./reduce";

const reduce: any = null;

function* aggregateSelector(event) {
  switch (event.type) {
    case 'purchase':
    case 'refund':
      return yield event.itemId;
    case 'audit':
      for (const { itemId } of event.items) {
        yield itemId;
      }
      return;
    case 'delist':
      return yield* event.itemIds;
  }
}

async function* aggregateReducer(aggregate, event) {
  switch (event.type) {

  }
}

export default reduce(
  aggregateSelector,
  aggregateReducer
);